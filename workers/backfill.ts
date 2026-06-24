import * as fs from "fs";
import * as path from "path";
import { getDb, closeDb } from "../src/lib/db/index";

const ARXIV_API = "https://export.arxiv.org/api/query";
const DATA_DIR = path.join(process.cwd(), "data");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");

interface StoredArticle {
  id: number; title: string; url: string; source: string;
  author: string; excerpt: string; content: string;
  category: string; tags: string[]; publicationDate: string;
  imageUrl: string | null; importanceScore: number;
  companies: string[]; technologies: string[]; processed: boolean;
}

function loadArticles(): StoredArticle[] {
  if (fs.existsSync(ARTICLES_FILE)) {
    return JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8"));
  }
  return [];
}

function saveArticles(articles: StoredArticle[]) {
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2));
}

async function backfillArxiv(query: string, source: string, category: string, maxResults = 500) {
  const existing = loadArticles();
  const existingUrls = new Set(existing.map((a) => a.url));
  let nextId = existing.length > 0 ? Math.max(...existing.map((a) => a.id)) + 1 : 1;
  let newCount = 0;
  let start = 0;

  while (start < maxResults) {
    const url = `${ARXIV_API}?search_query=${query}&start=${start}&max_results=100&sortBy=submittedDate&sortOrder=descending`;
    console.log(`  Fetching arXiv ${source} (${start}-${start + 100})...`);

    try {
      const res = await fetch(url);
      const xml = await res.text();

      const entries = xml.split("<entry>").slice(1);
      if (entries.length === 0) break;

      for (const entry of entries) {
        const idMatch = entry.match(/<id>(.*?)<\/id>/);
        const titleMatch = entry.match(/<title>(.*?)<\/title>/s);
        const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/s);
        const dateMatch = entry.match(/<published>(.*?)<\/published>/);
        const authorMatches = [...entry.matchAll(/<name>(.*?)<\/name>/g)];

        const paperUrl = idMatch ? idMatch[1].trim() : "";
        if (!paperUrl || existingUrls.has(paperUrl)) continue;

        const title = titleMatch
          ? titleMatch[1].replace(/\s+/g, " ").trim()
          : "Unknown";
        const summary = summaryMatch
          ? summaryMatch[1].replace(/\s+/g, " ").trim().slice(0, 1000)
          : "";
        const date = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
        const authors = authorMatches.map((m) => m[1].trim()).slice(0, 3).join(", ") || "Unknown";

        const article: StoredArticle = {
          id: nextId++,
          title,
          url: paperUrl.replace("arxiv.org/abs/", "arxiv.org/abs/"),
          source,
          author: authors,
          excerpt: summary.slice(0, 300),
          content: summary,
          category,
          tags: [category],
          publicationDate: date,
          imageUrl: null,
          importanceScore: 50,
          companies: [],
          technologies: [],
          processed: false,
        };

        existing.push(article);
        existingUrls.add(paperUrl);
        newCount++;
      }

      start += 100;
    } catch (err) {
      console.error(`  Error at ${start}:`, err);
      break;
    }
  }

  saveArticles(existing);
  console.log(`  → Added ${newCount} new articles from ${source}`);
  return newCount;
}

async function main() {
  console.log("Backfilling historical articles...\n");

  let total = 0;

  total += await backfillArxiv("all:AI+AND+cat:cs.AI", "arXiv AI", "research", 200);
  total += await backfillArxiv("all:Machine+learning+AND+cat:cs.LG", "arXiv ML", "research", 200);
  total += await backfillArxiv("all:robotics+AND+cat:cs.RO", "arXiv Robotics", "research", 200);
  total += await backfillArxiv("all:computer+vision+AND+cat:cs.CV", "arXiv Computer Vision", "research", 200);
  total += await backfillArxiv("all:natural+language+AND+cat:cs.CL", "arXiv Computation", "research", 200);

  // Re-import to SQLite
  const { importFromJson, exportToJson } = await import("../src/lib/db/index");
  importFromJson();
  const dbCount = exportToJson();
  closeDb();

  console.log(`\nDone! Added ${total} backdated articles. Total: ${dbCount}`);
}

main().catch(console.error);
