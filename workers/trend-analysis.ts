import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");

interface Article {
  id: number; title: string; category: string;
  publicationDate: string; tags: string[];
}

function loadArticles(): Article[] {
  if (fs.existsSync(ARTICLES_FILE)) {
    return JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8"));
  }
  return [];
}

interface Trend {
  topic: string;
  category: string;
  recent: number;
  previous: number;
  growth: number;
  articles: number[];
}

function main() {
  const articles = loadArticles().sort((a, b) =>
    new Date(a.publicationDate).getTime() - new Date(b.publicationDate).getTime()
  );

  const now = new Date();
  const recentCutoff = new Date(now.getTime() - 7 * 86400000);
  const previousCutoff = new Date(now.getTime() - 14 * 86400000);

  const tagCounts: Record<string, { recent: number; previous: number; category: string; ids: number[] }> = {};

  for (const article of articles) {
    const date = new Date(article.publicationDate);
    for (const tag of article.tags) {
      if (!tagCounts[tag]) tagCounts[tag] = { recent: 0, previous: 0, category: article.category, ids: [] };
      if (date >= recentCutoff) {
        tagCounts[tag].recent++;
        tagCounts[tag].ids.push(article.id);
      } else if (date >= previousCutoff) {
        tagCounts[tag].previous++;
      }
    }
  }

  const trends: Trend[] = Object.entries(tagCounts)
    .map(([topic, data]) => ({
      topic,
      category: data.category,
      recent: data.recent,
      previous: data.previous,
      growth: data.previous > 0 ? Math.round(((data.recent - data.previous) / data.previous) * 100) : data.recent > 0 ? 100 : 0,
      articles: data.ids.slice(0, 20),
    }))
    .filter(t => t.recent >= 2)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 30);

  console.log(`Found ${trends.length} trending topics`);

  const TRENDS_FILE = path.join(DATA_DIR, "trends.json");
  fs.writeFileSync(TRENDS_FILE, JSON.stringify(trends, null, 2));
  console.log(`Saved to ${TRENDS_FILE}`);
}

main();
