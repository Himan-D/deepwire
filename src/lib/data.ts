import * as fs from "fs";
import * as path from "path";

export interface Article {
  id: number;
  title: string;
  url: string;
  source: string;
  author: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  publicationDate: string;
  imageUrl: string | null;
  importanceScore: number;
  companies: string[];
  technologies: string[];
  processed: boolean;
}

export type NodeType = "company" | "person" | "technology" | "topic" | "source" | "category";
export type EdgeType = "mentions" | "develops" | "acquired_by" | "partners_with" | "competes_with" | "co_occurs" | "categorizes" | "covers" | "employs";

export interface KGNode {
  id: string;
  type: NodeType;
  name: string;
  articleCount: number;
  importance: number;
  lastSeen: string;
}

export interface KGEdge {
  source: string;
  target: string;
  weight: number;
  relationship: EdgeType;
  directed: boolean;
  firstSeen: string;
  lastSeen: string;
}

export interface KGStats {
  totalArticles: number;
  totalNodes: number;
  totalEdges: number;
  filteredNodes: number;
  filteredEdges: number;
  nodeTypeBreakdown: Record<string, number>;
  relationshipBreakdown: Record<string, number>;
  topCompanies: string[];
  topPeople: string[];
  topTechnologies: string[];
  topTopics: string[];
  topSources: string[];
  generatedAt: string;
}

export interface KnowledgeGraph {
  stats?: KGStats;
  nodes: KGNode[];
  edges: KGEdge[];
}

let cachedArticles: Article[] | null = null;
let allArticles: Article[] | null = null;
let cachedKG: KnowledgeGraph | null = null;
let cachedEmbeddings: Map<number, number[]> | null = null;

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

export function getAllArticles(): Article[] {
  if (allArticles) return allArticles;

  try {
    const filePath = path.join(DATA_DIR, "articles.json");
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf-8");
    allArticles = JSON.parse(data);
    return allArticles!;
  } catch {
    return [];
  }
}

export function getArticles(options?: {
  category?: string;
  limit?: number;
  offset?: number;
  minImportance?: number;
  source?: string;
}): Article[] {
  const articles = getAllArticles();

  let filtered = articles.filter((a) => {
    if (options?.category && a.category !== options.category) return false;
    if (options?.minImportance && (a.importanceScore || 0) < options.minImportance) return false;
    if (options?.source && a.source !== options.source) return false;
    return true;
  });

  filtered.sort(
    (a, b) =>
      new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
  );

  if (options?.offset) filtered = filtered.slice(options.offset);
  if (options?.limit) filtered = filtered.slice(0, options.limit);

  return filtered;
}

export function getArticleById(id: number): Article | undefined {
  return getAllArticles().find((a) => a.id === id);
}

export function getArticleBySlug(slug: number): Article | undefined {
  return getArticleById(slug);
}

const SOURCE_AUTHORITY: Record<string, number> = {
  "arXiv AI": 90, "arXiv ML": 90, "arXiv Robotics": 85, "arXiv CV": 85,
  "Google Research Blog": 95, "DeepMind Blog": 95, "OpenAI Blog": 95,
  "Anthropic Blog": 95, "Meta AI Blog": 90, "Stratechery": 95,
  "Bloomberg Tech": 90, "TechCrunch": 80, "Wired": 80,
  "The Verge": 75, "VentureBeat": 80, "Ars Technica": 85,
  "MIT Technology Review": 90, "Nature": 90, "Science Magazine": 90,
  "SemiAnalysis": 90, "EE Times": 80, "Astral Codex Ten": 85,
  "Gwern": 90, "LessWrong": 80, "Latent Space": 85,
  "Interconnects": 85, "Search Engine Journal": 70,
};

function getSourceAuthority(source: string): number {
  for (const [key, val] of Object.entries(SOURCE_AUTHORITY)) {
    if (source.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return 60;
}

function computeImportanceScore(article: Article): number {
  const now = new Date();
  const pubDate = new Date(article.publicationDate);
  const ageHours = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60);

  const recencyBoost = Math.max(0, 100 - ageHours * 0.5);
  const authority = getSourceAuthority(article.source);
  const lengthBoost = Math.min(20, (article.content?.length || 0) / 500);

  const raw = recencyBoost * 0.4 + authority * 0.4 + lengthBoost * 0.2;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

export function getTrendingArticles(limit: number = 4): Article[] {
  const articles = getAllArticles();
  const now = new Date();

  const scored = articles.map((a) => {
    const ageHours = (now.getTime() - new Date(a.publicationDate).getTime()) / (1000 * 60 * 60);
    const recencyFactor = Math.max(0, 1 - ageHours / 720);
    const crossSource = (a.companies?.length || 0) + (a.technologies?.length || 0);
    const finalScore = (a.importanceScore || 0) * 0.3 + recencyFactor * 40 + crossSource * 3;
    return { article: a, score: finalScore };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((r) => r.article);
}

export function getTopStories(limit: number = 15): Article[] {
  const articles = getAllArticles();
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  return articles
    .filter((a) => new Date(a.publicationDate) > threeDaysAgo)
    .map((a) => ({ article: a, score: computeImportanceScore(a) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.article);
}

export function getArticlesByCategory(category: string, limit: number = 20): Article[] {
  return getArticles({ category, limit });
}

export function getTrendTopics(): Array<{
  topic: string;
  mentionCount: number;
  growthRate: number;
  category: string;
}> {
  const articles = getAllArticles();
  const now = new Date();
  const tagCounts: Record<string, { count: number; recent: number; category: string }> = {};

  for (const article of articles) {
    for (const tag of article.tags) {
      if (!tagCounts[tag]) tagCounts[tag] = { count: 0, recent: 0, category: article.category };
      tagCounts[tag].count++;
      const ageDays = (now.getTime() - new Date(article.publicationDate).getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays <= 3) tagCounts[tag].recent++;
    }
  }

  return Object.entries(tagCounts)
    .map(([topic, data]) => ({
      topic,
      mentionCount: data.count,
      growthRate: data.count > 0 ? Math.round((data.recent / data.count) * 100) : 0,
      category: data.category,
    }))
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, 15);
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
}

function computeTFIDF(docs: string[][]): Map<string, number>[] {
  const docCount = docs.length;
  const df = new Map<string, number>();

  for (const tokens of docs) {
    const seen = new Set(tokens);
    for (const t of seen) df.set(t, (df.get(t) || 0) + 1);
  }

  return docs.map((tokens) => {
    const tfidf = new Map<string, number>();
    const maxFreq = Math.max(1, ...tokens.map((t) => tokens.filter((x) => x === t).length));
    for (const t of tokens) {
      const tf = tokens.filter((x) => x === t).length / maxFreq;
      const idf = Math.log((docCount + 1) / ((df.get(t) || 0) + 1)) + 1;
      tfidf.set(t, tf * idf);
    }
    return tfidf;
  });
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, normA = 0, normB = 0;
  for (const [k, v] of a) {
    normA += v * v;
    const bv = b.get(k) || 0;
    dot += v * bv;
  }
  for (const v of b.values()) normB += v * v;
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase();
  const articles = getAllArticles();

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.source.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q)
  );

  if (filtered.length > 0) {
    return filtered
      .sort(
        (a, b) =>
          (b.importanceScore || 0) - (a.importanceScore || 0) ||
          new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
      )
      .slice(0, 50);
  }

  const allTexts = articles.map((a) => `${a.title} ${a.excerpt}`);
  const allTokens = allTexts.map(tokenize);
  const queryTokens = tokenize(query);
  const vectors = computeTFIDF(allTokens);
  const queryVec = computeTFIDF([queryTokens])[0];

  const scored = articles
    .map((a, i) => ({ article: a, score: cosineSimilarity(vectors[i], queryVec) }))
    .filter((r) => r.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return scored.map((r) => r.article);
}

export function getSources(): Array<{ name: string; articleCount: number }> {
  const articles = getAllArticles();
  const sourceMap: Record<string, number> = {};

  for (const article of articles) {
    sourceMap[article.source] = (sourceMap[article.source] || 0) + 1;
  }

  return Object.entries(sourceMap)
    .map(([name, articleCount]) => ({ name, articleCount }))
    .sort((a, b) => b.articleCount - a.articleCount);
}

export function getRelatedArticles(id: number, limit: number = 5): Article[] {
  const article = getArticleById(id);
  if (!article) return [];

  const articles = getAllArticles();
  return articles
    .filter((a) => a.id !== id)
    .map((a) => {
      const tagOverlap = a.tags.filter((t) => article.tags.includes(t)).length;
      const sameSource = a.source === article.source ? 1 : 0;
      const sameCategory = a.category === article.category ? 2 : 0;
      return { article: a, score: tagOverlap + sameSource + sameCategory };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.article);
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getSourceBySlug(slug: string): string | undefined {
  const sources = getSources();
  return sources.find((s) => slugify(s.name) === slug)?.name;
}

export function loadKnowledgeGraph(): KnowledgeGraph {
  if (cachedKG) return cachedKG;
  try {
    const filePath = path.join(DATA_DIR, "knowledge-graph.json");
    if (!fs.existsSync(filePath)) {
      cachedKG = { nodes: [], edges: [] };
      return cachedKG;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    cachedKG = JSON.parse(data);
    return cachedKG;
  } catch {
    cachedKG = { nodes: [], edges: [] };
    return cachedKG;
  }
}

export function getKnowledgeGraph(): KnowledgeGraph {
  return loadKnowledgeGraph();
}

export function getTopEntities(type?: KGNode["type"], limit: number = 10): KGNode[] {
  const kg = loadKnowledgeGraph();
  let nodes = kg.nodes;
  if (type) nodes = nodes.filter((n) => n.type === type);
  return nodes.sort((a, b) => b.articleCount - a.articleCount).slice(0, limit);
}

export function getNodeConnections(nodeId: string): { node: KGNode; edges: KGEdge[] } | null {
  const kg = loadKnowledgeGraph();
  const node = kg.nodes.find((n) => n.id === nodeId);
  if (!node) return null;
  const edges = kg.edges.filter((e) => e.source === nodeId || e.target === nodeId);
  return { node, edges };
}

export function getRelatedEntities(nodeId: string, limit: number = 5): Array<{ node: KGNode; weight: number }> {
  const kg = loadKnowledgeGraph();
  const connections = getNodeConnections(nodeId);
  if (!connections) return [];

  const related = new Map<string, { node: KGNode; weight: number }>();
  for (const edge of connections.edges) {
    const relatedId = edge.source === nodeId ? edge.target : edge.source;
    const relatedNode = kg.nodes.find((n) => n.id === relatedId);
    if (relatedNode && relatedNode.id !== nodeId) {
      const existing = related.get(relatedId);
      if (existing) {
        existing.weight += edge.weight;
      } else {
        related.set(relatedId, { node: relatedNode, weight: edge.weight });
      }
    }
  }

  return Array.from(related.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

export function getEntityRecommendations(entityId: string, limit: number = 6): Array<{ node: KGNode; path: string; score: number }> {
  const kg = loadKnowledgeGraph();
  const connected = getRelatedEntities(entityId, 20);
  const secondDegree = new Map<string, { node: KGNode; path: string; score: number }>();

  for (const { node: hop1 } of connected) {
    const hop2s = getRelatedEntities(hop1.id, 10);
    for (const { node: hop2 } of hop2s) {
      if (hop2.id === entityId) continue;
      if (connected.some((c) => c.node.id === hop2.id)) continue;
      const score = (hop1.importance || hop1.articleCount) * 0.3 + (hop2.importance || hop2.articleCount) * 0.7;
      const key = hop2.id;
      if (!secondDegree.has(key) || score > secondDegree.get(key)!.score) {
        secondDegree.set(key, { node: hop2, path: `${hop1.name} → ${hop2.name}`, score });
      }
    }
  }

  return Array.from(secondDegree.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function searchGraphEntities(query: string): Array<{ node: KGNode; score: number }> {
  const kg = loadKnowledgeGraph();
  const q = query.toLowerCase();
  const scored = kg.nodes
    .filter((n) => n.name.toLowerCase().includes(q))
    .map((n) => ({ node: n, score: n.importance || n.articleCount }));
  return scored.sort((a, b) => b.score - a.score).slice(0, 20);
}

export function getGraphNeighborhood(entityId: string, depth: number = 2): KnowledgeGraph {
  const kg = loadKnowledgeGraph();
  const visited = new Set<string>();
  const nodeSet = new Map<string, KGNode>();
  const edgeSet = new Map<string, KGEdge>();

  function traverse(currentId: string, remainingDepth: number) {
    if (remainingDepth < 0 || visited.has(currentId)) return;
    visited.add(currentId);

    const node = kg.nodes.find((n) => n.id === currentId);
    if (!node) return;
    nodeSet.set(currentId, node);

    const incident = kg.edges.filter((e) => e.source === currentId || e.target === currentId);
    for (const edge of incident) {
      const key = `${edge.source}::${edge.target}::${edge.relationship}`;
      edgeSet.set(key, edge);
      const neighborId = edge.source === currentId ? edge.target : edge.source;
      traverse(neighborId, remainingDepth - 1);
    }
  }

  traverse(entityId, depth);
  return { nodes: [...nodeSet.values()], edges: [...edgeSet.values()] };
}

export function getGraphStats(): KGStats {
  const kg = loadKnowledgeGraph();
  return kg.stats || {
    totalArticles: 0,
    totalNodes: kg.nodes.length,
    totalEdges: kg.edges.length,
    filteredNodes: kg.nodes.length,
    filteredEdges: kg.edges.length,
    nodeTypeBreakdown: {},
    relationshipBreakdown: {},
    topCompanies: [],
    topPeople: [],
    topTechnologies: [],
    topTopics: [],
    topSources: [],
    generatedAt: new Date().toISOString(),
  };
}

export function getGraphTimeline(): Array<{ date: string; nodeCount: number; edgeCount: number; topEntities: string[] }> {
  const kg = loadKnowledgeGraph();
  const months = new Map<string, { nodes: Set<string>; edges: Set<string>; entities: Map<string, number> }>();

  for (const node of kg.nodes) {
    const d = node.lastSeen.slice(0, 7);
    if (!months.has(d)) months.set(d, { nodes: new Set(), edges: new Set(), entities: new Map() });
    months.get(d)!.nodes.add(node.id);
  }

  for (const edge of kg.edges) {
    const d = edge.lastSeen.slice(0, 7);
    if (months.has(d)) months.get(d)!.edges.add(`${edge.source}::${edge.target}`);
    for (const [id, eid] of [edge.source, edge.target].entries()) {
      const node = kg.nodes.find((n) => n.id === eid);
      if (node && months.has(d)) {
        const m = months.get(d)!;
        m.entities.set(node.name, (m.entities.get(node.name) || 0) + 1);
      }
    }
  }

  return Array.from(months.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      nodeCount: data.nodes.size,
      edgeCount: data.edges.size,
      topEntities: [...data.entities.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name),
    }));
}

export function getTodayArticles(): Article[] {
  const articles = getAllArticles();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTodayMs = startOfToday.getTime();

  return articles
    .filter((a) => new Date(a.publicationDate).getTime() >= startOfTodayMs)
    .sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0))
    .slice(0, 10);
}
