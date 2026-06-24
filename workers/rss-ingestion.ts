import { parseFeed } from "../src/lib/rss/parser";
import { defaultSources } from "../src/lib/rss/sources";
import { classifyArticle, getPrimaryCategory } from "../src/lib/ai/classify";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");
const SOURCES_FILE = path.join(DATA_DIR, "sources-state.json");

interface StoredArticle {
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

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadArticles(): StoredArticle[] {
  ensureDataDir();
  if (fs.existsSync(ARTICLES_FILE)) {
    return JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8"));
  }
  return [];
}

function saveArticles(articles: StoredArticle[]) {
  ensureDataDir();
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2));
}

function loadSourceState(): Record<string, string> {
  if (fs.existsSync(SOURCES_FILE)) {
    return JSON.parse(fs.readFileSync(SOURCES_FILE, "utf-8"));
  }
  return {};
}

function saveSourceState(state: Record<string, string>) {
  fs.writeFileSync(SOURCES_FILE, JSON.stringify(state, null, 2));
}

async function ingestSource(source: { name: string; feedUrl: string; category: string; authority: number }) {
  console.log(`[${source.name}] Fetching feed: ${source.feedUrl}`);
  
  const sourceState = loadSourceState();
  const existingArticles = loadArticles();
  const existingUrls = new Set(existingArticles.map((a) => a.url));
  let newCount = 0;

  try {
    const items = (await parseFeed(source.feedUrl)).slice(0, 30);
    let nextId = existingArticles.length > 0 
      ? Math.max(...existingArticles.map((a) => a.id)) + 1 
      : 1;

    for (const item of items) {
      if (existingUrls.has(item.url)) continue;

      const categories = classifyArticle(item.title, item.content);
      const primaryCategory = getPrimaryCategory(item.title, item.content, source.name);

      const article: StoredArticle = {
        id: nextId++,
        title: item.title,
        url: item.url,
        source: source.name,
        author: item.author,
        excerpt: item.excerpt.slice(0, 300),
        content: item.content.slice(0, 10000),
        category: primaryCategory,
        tags: categories,
        publicationDate: item.publicationDate.toISOString(),
        imageUrl: item.imageUrl,
        importanceScore: Math.min(100, Math.round(source.authority * 10 + (categories.length > 1 ? 5 : 0))),
        companies: [],
        technologies: [],
        processed: false,
      };

      existingArticles.push(article);
      existingUrls.add(item.url);
      newCount++;
    }

    console.log(`[${source.name}] Found ${items.length} items, ${newCount} new`);
    
    sourceState[source.feedUrl] = new Date().toISOString();
    saveSourceState(sourceState);
    saveArticles(existingArticles);

  } catch (error) {
    console.error(`[${source.name}] Error:`, error);
  }
}

async function main() {
  console.log("Starting RSS ingestion...\n");
  
  const specificSource = process.argv[2];
  
  if (specificSource) {
    const source = defaultSources.find(
      (s) => s.name.toLowerCase() === specificSource.toLowerCase()
    );
    if (source) {
      await ingestSource(source);
    } else {
      console.error(`Source "${specificSource}" not found`);
    }
  } else {
    for (const source of defaultSources) {
      await ingestSource(source);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  const articles = loadArticles();
  console.log(`\nDone! Total articles: ${articles.length}`);
}

main().catch(console.error);
