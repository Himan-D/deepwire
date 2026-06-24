import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");
const KG_FILE = path.join(DATA_DIR, "knowledge-graph.json");

interface Article {
  id: number; title: string; url: string; source: string;
  excerpt: string; content: string; category: string;
  tags: string[]; publicationDate: string; companies: string[];
  technologies: string[]; author: string;
}

type NodeType = "company" | "person" | "technology" | "topic" | "source" | "category";
type EdgeType = "mentions" | "develops" | "acquired_by" | "partners_with" | "competes_with" | "co_occurs" | "categorizes" | "covers" | "employs";

interface KGNode {
  id: string; type: NodeType; name: string;
  articleCount: number; importance: number; lastSeen: string;
}

interface KGEdge {
  source: string; target: string; weight: number;
  relationship: EdgeType; directed: boolean; firstSeen: string; lastSeen: string;
}

const KNOWN_COMPANIES = new Set([
  "openai", "anthropic", "google", "deepmind", "microsoft", "meta", "apple",
  "nvidia", "amd", "intel", "tesla", "spacex", "amazon", "aws", "ibm",
  "oracle", "salesforce", "hugging face", "cohere", "mistral", "stability ai",
  "midjourney", "perplexity", "databricks", "snowflake", "palantir",
  "qualcomm", "arm", "tsmc", "samsung", "broadcom", "cisco",
  "adobe", "spotify", "netflix", "uber", "airbnb", "xai",
  "scale ai", "datadog", "cloudflare", "elastic",
  "mongodb", "digitalocean", "github", "gitlab", "red hat", "canonical",
  "linkedin", "cruise", "waymo", "zoox", "aurora", "pony.ai",
  "baidu", "tencent", "alibaba", "bytedance", "huawei", "xiaomi",
  "sap", "servicenow", "workday", "twilio", "stripe", "square",
  "robinhood", "coinbase", "chainlink", "solana", "ethereum",
  "palo alto networks", "crowdstrike", "zscaler", "fortinet",
  "unity", "epic games", "roblox", "electronic arts",
  "moderna", "bioNTech", "illumina", "23andme",
  "notion", "figma", "canva", "linear", "vercel",
  "eightfold ai", "dataiku", "data robot", "samsara",
  "lyft", "doordash", "instacart", "airtable",
  "robinhood", "betterment", "chime", "plaid",
  "confluent", "hashicorp", "databricks", "snowflake",
  "snyk", "checkmarx", "veracode", "aqua security",
  "wiz", "sentinelone", "darktrace", "crowdstrike",
  "asana", "monday.com", "jira", "confluence",
  "replit", "codespaces", "gitpod", "devin", "cursor",
]);

const KNOWN_PEOPLE = new Set([
  "sam altman", "elon musk", "yann lecun", "andrew ng", "andrej karpathy",
  "demis hassabis", "mira murati", "satya nadella", "sundar pichai",
  "tim cook", "jensen huang", "lisa su", "patrick collison",
  "mark zuckerberg", "ilya sutskever", "geoffrey hinton",
  "fei-fei li", "kareem carr", "jim fan", "emma brunskill",
  "david ha", "yi ma", "aidan gomez", "noam brown",
  "dario amodei", "daniela amodei", "jack clark",
  "emad mostaque", "eric schmidt", "mustafa suleyman",
  "kevin systrom", "mike krieger", "jack dorsey",
  "brian chesky", "travis kalanick", "reed hastings",
  "jeff bezos", "warren buffett", "bill gates",
  "larry page", "sergey brin", "peter thiel",
  "paul graham", "jessica livingston", "marc andreessen",
  "ben horowitz", "sequoia capital", "a16z", "y combinator",
  "garry tan", "naval ravikant", "balaji srinivasan",
  "vitalik buterin", "brian armstrong", "changpeng zhao",
  "sam bankman-fried", "gavin wood", "joe lubin",
  "kevin rose", "tim ferriss", "elon musk",
  "lex fridman", "jordan peterson", "yuval noah harari",
  "ray kurzweil", "nick bostrom", "max tegmark",
  "steve jobs", "steve wozniak", "paul allen",
  "linus torvalds", "richard stallman", "guido van rossum",
  "brendan eich", "john carmack", "markus persson",
  "shigeru miyamoto", "hikaru nakamura", "garry kasparov",
  "magnus carlsen", "jensen huang", "elon musk",
  "marc raibert", "daniel dennett", "john searle",
  "david chalmers", "computer science", "engineering",
]);

const KNOWN_TECHNOLOGIES = new Set([
  "transformers", "large language model", "llm", "gpt", "diffusion",
  "neural network", "deep learning", "machine learning", "reinforcement learning",
  "transformer architecture", "attention mechanism", "cnn", "rnn", "lstm",
  "gan", "variational autoencoder", "normalizing flow",
  "rag", "retrieval augmented generation", "fine tuning", "prompt engineering",
  "chain of thought", "tree of thought", "constitutional ai", "rlhf",
  "quantization", "distillation", "pruning", "sparsity",
  "mixture of experts", "moe", "sparse moe",
  "vector database", "embedding", "semantic search", "cosine similarity",
  "knowledge graph", "graph neural network", "gnn",
  "cuda", "tensorflow", "pytorch", "jax", "keras", "onnx",
  "triton", "vulkan", "metal", "directml",
  "kubernetes", "docker", "terraform", "ansible",
  "rust", "python", "typescript", "go", "java", "c++",
  "react", "next.js", "svelte", "vue", "angular",
  "postgresql", "mysql", "sqlite", "mongodb", "redis",
  "kafka", "rabbitmq", "spark", "flink", "dask",
  "webgpu", "webassembly", "wasm", "webgl",
  "blockchain", "smart contract", "defi", "nft", "dao",
  "quantum computing", "qubit", "quantum supremacy",
  "edge ai", "tiny ml", "on-device ai", "federated learning",
  "multimodal", "vision language model", "speech recognition",
  "text to speech", "speech to text", "whisper", "bark",
  "stable diffusion", "dall-e", "midjourney", "imagen",
  "nerf", "gaussian splatting", "3d reconstruction",
  "slam", "computer vision", "object detection", "segmentation",
  "reinforcement learning from human feedback",
  "constitutional ai", "anthropic",
  "tools use", "function calling", "code generation",
  "autonomous agent", "agent", "multi-agent", "agentic",
  "planning", "reasoning", "memory", "persistence",
]);

const ACQUISITION_KEYWORDS = /\b(acquired|acquisition|buy|bought|purchased|merge|merger)\b/i;
const PARTNERSHIP_KEYWORDS = /\b(partner|partnership|collaborate|collaboration|alliance|joint venture)\b/i;
const COMPETITION_KEYWORDS = /\b(competitor|compete|rival|rivalry|competition|battle|against)\b/i;
const INVESTMENT_KEYWORDS = /\b(invest|investment|funding|series [a-z]|raised|venture capital|led by)\b/i;

function getRelationship(context: string, src: string, tgt: string): EdgeType {
  const lower = context.toLowerCase();
  const srcLower = src.toLowerCase();
  const tgtLower = tgt.toLowerCase();

  if (ACQUISITION_KEYWORDS.test(lower)) {
    if (lower.indexOf(tgtLower) < lower.indexOf(srcLower)) return "acquired_by";
  }
  if (PARTNERSHIP_KEYWORDS.test(lower)) return "partners_with";
  if (COMPETITION_KEYWORDS.test(lower)) return "competes_with";

  return "co_occurs";
}

function extractEntities(text: string): { companies: string[]; people: string[]; technologies: string[] } {
  const lower = text.toLowerCase();
  const companies: string[] = [];
  const people: string[] = [];
  const technologies: string[] = [];

  for (const co of KNOWN_COMPANIES) {
    if (lower.includes(co)) companies.push(co);
  }
  for (const p of KNOWN_PEOPLE) {
    if (lower.includes(p)) {
      if (!["computer science", "engineering"].includes(p)) {
        people.push(p);
      }
    }
  }
  for (const tech of KNOWN_TECHNOLOGIES) {
    if (lower.includes(tech)) technologies.push(tech);
  }

  return { companies: [...new Set(companies)], people: [...new Set(people)], technologies: [...new Set(technologies)] };
}

function computeImportance(articleCount: number, lastSeen: string, now: Date): number {
  const ageDays = (now.getTime() - new Date(lastSeen).getTime()) / (1000 * 60 * 60 * 24);
  const recencyBoost = Math.max(0, 1 - ageDays / 90);
  return Math.round(articleCount * (0.7 + 0.3 * recencyBoost) * 10) / 10;
}

function getCategoryFromTag(tag: string, category: string, categoriesMap: Map<string, Set<string>>) {
  const cat = categoriesMap.get(tag);
  return cat || "uncategorized";
}

function main() {
  const articles: Article[] = JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8"));
  const now = new Date();
  console.log(`Building enriched knowledge graph from ${articles.length} articles...`);

  const nodes = new Map<string, KGNode>();
  const edges = new Map<string, KGEdge>();
  const articleEntityMap = new Map<number, Set<string>>();

  const categoryTopicMap = new Map<string, Set<string>>();
  for (const article of articles) {
    for (const tag of article.tags) {
      if (!categoryTopicMap.has(article.category)) {
        categoryTopicMap.set(article.category, new Set());
      }
      categoryTopicMap.get(article.category)!.add(tag);
    }
  }

  function addNode(id: string, type: NodeType, name: string, date: string) {
    if (!nodes.has(id)) {
      nodes.set(id, { id, type, name, articleCount: 0, importance: 0, lastSeen: date });
    }
    const n = nodes.get(id)!;
    n.articleCount++;
    if (date > n.lastSeen) n.lastSeen = date;
    n.importance = computeImportance(n.articleCount, n.lastSeen, now);
  }

  function addEdge(src: string, tgt: string, rel: EdgeType, date: string, directed: boolean = false) {
    const key = directed ? `${src}::${tgt}::${rel}` : [src, tgt].sort().join("::") + `::${rel}`;
    if (!edges.has(key)) {
      edges.set(key, { source: src, target: tgt, weight: 0, relationship: rel, directed, firstSeen: date, lastSeen: date });
    }
    const e = edges.get(key)!;
    e.weight++;
    if (date > e.lastSeen) e.lastSeen = date;
  }

  for (const article of articles) {
    const { id, title, excerpt, content, source, category, tags, technologies: articleTechs, publicationDate: date } = article;
    const text = `${title} ${excerpt} ${content || ""}`.slice(0, 5000);
    const { companies, people, technologies: extractedTechs } = extractEntities(text);
    const allTechs = [...new Set([...extractedTechs, ...(articleTechs || [])])];

    addNode(`source:${source}`, "source", source, date);
    addNode(`category:${category}`, "category", category, date);
    addEdge(`source:${source}`, `category:${category}`, "covers", date, true);

    const articleEntities = new Set<string>();
    articleEntities.add(`source:${source}`);
    articleEntities.add(`category:${category}`);

    for (const co of companies) {
      const nodeId = `co:${co}`;
      addNode(nodeId, "company", co, date);
      addEdge(`source:${source}`, nodeId, "mentions", date, true);
      if (category === "startups" && INVESTMENT_KEYWORDS.test(text)) {
        addEdge(nodeId, `category:startups`, "categorizes", date, true);
      }
      articleEntities.add(nodeId);
    }

    for (const p of people) {
      const nodeId = `person:${p}`;
      addNode(nodeId, "person", p, date);
      addEdge(`source:${source}`, nodeId, "mentions", date, true);
      articleEntities.add(nodeId);
    }

    for (const tech of allTechs) {
      const nodeId = `tech:${tech}`;
      addNode(nodeId, "technology", tech, date);
      addEdge(`source:${source}`, nodeId, "mentions", date, true);
      articleEntities.add(nodeId);
    }

    for (const tag of tags) {
      const nodeId = `topic:${tag}`;
      addNode(nodeId, "topic", tag, date);
      addEdge(`source:${source}`, nodeId, "covers", date, true);
      articleEntities.add(nodeId);
    }

    const entityArr = [...articleEntities];
    for (let i = 0; i < entityArr.length; i++) {
      for (let j = i + 1; j < entityArr.length; j++) {
        const src = entityArr[i];
        const tgt = entityArr[j];
        const srcType = src.split(":")[0];
        const tgtType = tgt.split(":")[0];

        let rel: EdgeType = "co_occurs";
        if (srcType === "co" && tgtType === "co" && companies.length >= 2) {
          rel = getRelationship(text, src.replace("co:", ""), tgt.replace("co:", ""));
        }
        addEdge(src, tgt, rel, date);
      }
    }

    articleEntityMap.set(id, articleEntities);
  }

  addNode("category:uncategorized", "category", "uncategorized", "2020-01-01");

  const communityMap = new Map<string, string[]>();
  for (const [nodeId, node] of nodes) {
    if (!communityMap.has(node.type)) communityMap.set(node.type, []);
    communityMap.get(node.type)!.push(nodeId);
  }

  const topNodes = [...nodes.values()]
    .filter((n) => n.articleCount >= 2)
    .sort((a, b) => b.importance - a.importance);

  const topEdges = [...edges.values()]
    .filter((e) => e.weight >= 2)
    .sort((a, b) => b.weight - a.weight);

  const stats = {
    totalArticles: articles.length,
    totalNodes: nodes.size,
    totalEdges: edges.size,
    filteredNodes: topNodes.length,
    filteredEdges: topEdges.length,
    nodeTypeBreakdown: Object.fromEntries(
      [...new Set([...nodes.values()].map((n) => n.type))].map((t) => [t, [...nodes.values()].filter((n) => n.type === t).length])
    ),
    relationshipBreakdown: Object.fromEntries(
      [...new Set([...edges.values()].map((e) => e.relationship))].map((r) => [r, [...edges.values()].filter((e) => e.relationship === r).length])
    ),
    topCompanies: [...nodes.values()].filter((n) => n.type === "company").sort((a, b) => b.importance - a.importance).slice(0, 10).map((n) => n.name),
    topPeople: [...nodes.values()].filter((n) => n.type === "person").sort((a, b) => b.importance - a.importance).slice(0, 10).map((n) => n.name),
    topTechnologies: [...nodes.values()].filter((n) => n.type === "technology").sort((a, b) => b.importance - a.importance).slice(0, 10).map((n) => n.name),
    topTopics: [...nodes.values()].filter((n) => n.type === "topic").sort((a, b) => b.importance - a.importance).slice(0, 10).map((n) => n.name),
    topSources: [...nodes.values()].filter((n) => n.type === "source").sort((a, b) => b.importance - a.importance).slice(0, 10).map((n) => n.name),
    generatedAt: now.toISOString(),
  };

  const graph = {
    stats,
    nodes: topNodes,
    edges: topEdges,
  };

  fs.writeFileSync(KG_FILE, JSON.stringify(graph, null, 2));
  console.log(`\nKnowledge Graph Stats:`);
  console.log(`  Nodes: ${nodes.size} (filtered: ${topNodes.length})`);
  console.log(`  Edges: ${edges.size} (filtered: ${topEdges.length})`);
  console.log(`\n  Type breakdown:`);
  for (const [type, count] of Object.entries(stats.nodeTypeBreakdown)) {
    console.log(`    ${type}: ${count}`);
  }
  console.log(`\n  Top companies: ${stats.topCompanies.join(", ")}`);
  console.log(`  Top people: ${stats.topPeople.join(", ")}`);
  console.log(`  Top technologies: ${stats.topTechnologies.join(", ")}`);
  console.log(`  Top topics: ${stats.topTopics.join(", ")}`);
}

main();
