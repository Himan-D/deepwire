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

interface KGNode {
  id: string; type: "company" | "person" | "technology" | "topic" | "source";
  name: string; articleCount: number; lastSeen: string;
}

interface KGEdge {
  source: string; target: string; weight: number;
  relationship: "mentions" | "develops" | "acquired_by" | "partners_with";
}

const KNOWN_COMPANIES = [
  "openai", "anthropic", "google", "deepmind", "microsoft", "meta", "apple",
  "nvidia", "amd", "intel", "tesla", "spacex", "amazon", "aws", "ibm",
  "oracle", "salesforce", "hugging face", "cohere", "mistral", "stability ai",
  "midjourney", "perplexity", "databricks", "snowflake", "palantir",
  "qualcomm", "arm", "tsmc", "samsung", "broadcom", "cisco", "oracle",
  "adobe", "spotify", "netflix", "uber", "airbnb", "twitter", "xai",
  "linkedin", "palantir", "scale ai", "datadog", "cloudflare", "elastic",
  "mongodb", "digitalocean", "github", "gitlab", "red hat", "canonical",
];

const KNOWN_PEOPLE = [
  "sam altman", "elon musk", "yann lecun", "andrew ng", "andrej karpathy",
  "demis hassabis", "mira murati", "satya nadella", "sundar pichai",
  "tim cook", "jensen huang", "lisa su", "patrick collison", "mark zuckerberg",
  "ilya sutskever", "geoffrey hinton", "yan lecun", "fei-fei li",
  "kareem carr", "jim fan", "emma brunskill", "david ha", "yi ma",
];

function extractEntities(text: string): { companies: string[]; people: string[] } {
  const lower = text.toLowerCase();
  const companies = KNOWN_COMPANIES.filter((c) => lower.includes(c));
  const people = KNOWN_PEOPLE.filter((p) => lower.includes(p));
  return { companies, people };
}

function main() {
  const articles: Article[] = JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8"));
  console.log(`Building knowledge graph from ${articles.length} articles...`);

  const nodes = new Map<string, KGNode>();
  const edges = new Map<string, KGEdge>();

  function addNode(id: string, type: KGNode["type"], name: string, date: string) {
    if (!nodes.has(id)) {
      nodes.set(id, { id, type, name, articleCount: 0, lastSeen: date });
    }
    const n = nodes.get(id)!;
    n.articleCount++;
    if (date > n.lastSeen) n.lastSeen = date;
  }

  function addEdge(src: string, tgt: string, rel: KGEdge["relationship"]) {
    const key = `${src}::${tgt}`;
    if (!edges.has(key)) {
      edges.set(key, { source: src, target: tgt, weight: 0, relationship: rel });
    }
    edges.get(key)!.weight++;
  }

  for (const article of articles) {
    const date = article.publicationDate;
    const { companies, people } = extractEntities(article.title + " " + article.excerpt);

    addNode(article.source, "source", article.source, date);

    for (const co of companies) {
      addNode(`co:${co}`, "company", co, date);
      addEdge(article.source, `co:${co}`, "mentions");
    }
    for (const p of people) {
      addNode(`person:${p}`, "person", p, date);
      addEdge(article.source, `person:${p}`, "mentions");
    }
    for (const tag of article.tags) {
      addNode(`topic:${tag}`, "topic", tag, date);
      addEdge(article.source, `topic:${tag}`, "mentions");
    }
    for (const tech of article.technologies) {
      addNode(`tech:${tech}`, "technology", tech, date);
      addEdge(article.source, `tech:${tech}`, "mentions");
    }
  }

  const graph = {
    nodes: Array.from(nodes.values()).sort((a, b) => b.articleCount - a.articleCount),
    edges: Array.from(edges.values()).sort((a, b) => b.weight - a.weight),
  };

  fs.writeFileSync(KG_FILE, JSON.stringify(graph, null, 2));
  console.log(`Graph: ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
}

main();
