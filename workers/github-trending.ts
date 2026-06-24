import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");

interface Article {
  id: number; title: string; url: string; source: string;
  excerpt: string; content: string; category: string;
  tags: string[]; publicationDate: string;
  imageUrl: string | null; importanceScore: number;
  companies: string[]; technologies: string[];
  author: string; processed: boolean;
}

const TOPICS = [
  "artificial-intelligence", "machine-learning", "deep-learning",
  "llm", "large-language-model", "ai-agents",
  "computer-vision", "nlp", "generative-ai",
];

async function fetchTrendingRepos(topic: string): Promise<any[]> {
  const url = `https://api.github.com/search/repositories?q=topic:${topic}+pushed:>${daysAgo(7)}&sort=stars&order=desc&per_page=5`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "deepwire/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as any;
    return data.items || [];
  } catch {
    return [];
  }
}

function daysAgo(n: number): string {
  const d = new Date(Date.now() - n * 86400000);
  return d.toISOString().split("T")[0];
}

async function main() {
  const articles: Article[] = fs.existsSync(ARTICLES_FILE)
    ? JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8"))
    : [];

  const existingUrls = new Set(articles.map((a) => a.url));
  let nextId = articles.length > 0 ? Math.max(...articles.map((a) => a.id)) + 1 : 1;
  let added = 0;

  for (const topic of TOPICS) {
    const repos = await fetchTrendingRepos(topic);
    for (const repo of repos) {
      const repoUrl = repo.html_url as string;
      if (existingUrls.has(repoUrl)) continue;

      const desc = (repo.description || "") as string;
      const lang = (repo.language || "") as string;
      const stars = (repo.stargazers_count || 0) as number;
      const today = new Date().toISOString();

      articles.push({
        id: nextId++,
        title: `[Trending] ${repo.full_name}: ${desc.slice(0, 100)}`,
        url: repoUrl,
        source: "GitHub Trending",
        author: repo.owner?.login || "",
        excerpt: `${repo.full_name} — ${desc} (${stars}★, ${lang})`.slice(0, 300),
        content: `<p><strong>${repo.full_name}</strong></p><p>${desc}</p><p>⭐ ${stars} stars &nbsp; 🗣 ${lang || "N/A"}</p><p><a href="${repoUrl}">View on GitHub →</a></p>`,
        category: "ai",
        tags: [topic, "github", lang].filter(Boolean),
        publicationDate: today,
        imageUrl: null,
        importanceScore: Math.min(100, Math.round(Math.log2(stars + 1) * 8)),
        companies: [],
        technologies: [lang].filter(Boolean),
        author: repo.owner?.login || "",
        processed: true,
      });
      existingUrls.add(repoUrl);
      added++;
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2));
  console.log(`Added ${added} trending repos`);
}

main().catch(console.error);
