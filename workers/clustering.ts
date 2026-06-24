import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");

interface Article {
  id: number; title: string; url: string; source: string;
  excerpt: string; content: string; category: string;
  tags: string[]; publicationDate: string;
  companies: string[]; technologies: string[];
}

interface Cluster {
  id: string;
  title: string;
  articles: number[];
  category: string;
  sourceCount: number;
  dateRange: { from: string; to: string };
}

function loadArticles(): Article[] {
  if (fs.existsSync(ARTICLES_FILE)) {
    return JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8"));
  }
  return [];
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const stopwords = new Set(["this", "that", "with", "from", "have", "been", "will", "they", "what", "about", "into", "over", "after", "other", "which", "their", "there", "would", "could", "should", "these", "those", "while", "where", "after", "before", "still", "being", "made", "make", "more", "also", "than", "very", "just", "much", "been", "some", "such", "each", "than", "them"]);
  return words.filter(w => !stopwords.has(w) && /^[a-z]+$/.test(w));
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function main() {
  const articles = loadArticles();
  console.log(`Clustering ${articles.length} articles...`);

  const clusters: Cluster[] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < articles.length; i++) {
    if (assigned.has(articles[i].id)) continue;
    const a = articles[i];
    const aKeywords = extractKeywords(a.title + " " + a.excerpt);
    const cluster: Cluster = {
      id: `cluster-${clusters.length}`,
      title: a.title,
      articles: [a.id],
      category: a.category,
      sourceCount: 1,
      dateRange: { from: a.publicationDate, to: a.publicationDate },
    };
    assigned.add(a.id);

    for (let j = i + 1; j < articles.length; j++) {
      if (assigned.has(articles[j].id)) continue;
      const b = articles[j];
      const bKeywords = extractKeywords(b.title + " " + b.excerpt);
      const similarity = jaccard(aKeywords, bKeywords);

      if (similarity > 0.55) {
        cluster.articles.push(b.id);
        assigned.add(b.id);
        cluster.sourceCount++;
        if (b.publicationDate < cluster.dateRange.from) cluster.dateRange.from = b.publicationDate;
        if (b.publicationDate > cluster.dateRange.to) cluster.dateRange.to = b.publicationDate;
      }
    }

    if (cluster.articles.length > 1) {
      clusters.push(cluster);
    }
  }

  console.log(`Found ${clusters.length} clusters (${assigned.size} articles clustered)`);

  const CLUSTERS_FILE = path.join(DATA_DIR, "clusters.json");
  fs.writeFileSync(CLUSTERS_FILE, JSON.stringify(clusters, null, 2));
  console.log(`Saved to ${CLUSTERS_FILE}`);
}

main();
