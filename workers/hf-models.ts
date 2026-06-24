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

const HF_API = "https://huggingface.co/api/models?sort=downloads&direction=-1&limit=30";

async function main() {
  const articles: Article[] = fs.existsSync(ARTICLES_FILE)
    ? JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8"))
    : [];

  const existingUrls = new Set(articles.map((a) => a.url));
  let nextId = articles.length > 0 ? Math.max(...articles.map((a) => a.id)) + 1 : 1;
  let added = 0;

  try {
    const res = await fetch(HF_API, {
      headers: { "User-Agent": "deepwire/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) { console.error("HF API error:", res.status); return; }
    const models = await res.json() as any[];

    for (const model of models.slice(0, 15)) {
      const modelUrl = `https://huggingface.co/${model.id}`;
      if (existingUrls.has(modelUrl)) continue;

      const pipelineTag = model.pipeline_tag || "";
      const downloads = (model.downloads || 0) as number;
      const likes = (model.likes || 0) as number;
      const tags = [pipelineTag, "huggingface", "model"].filter(Boolean);

      const categoryMap: Record<string, string> = {
        "text-generation": "ai", "image-generation": "ai",
        "token-classification": "ai", "text-classification": "ai",
        "automatic-speech-recognition": "ai", "image-classification": "ai",
        "object-detection": "computer-vision", "image-segmentation": "computer-vision",
        "text-to-image": "ai", "text-to-speech": "ai",
        "question-answering": "ai", "translation": "ai",
        "summarization": "ai", "sentence-similarity": "research",
      };

      const today = new Date().toISOString();

      articles.push({
        id: nextId++,
        title: `[Model] ${model.id}`,
        url: modelUrl,
        source: "Hugging Face",
        author: model.id?.split("/")[0] || "",
        excerpt: `${model.id} — ${pipelineTag} · ${downloads.toLocaleString()} downloads · ${likes} likes`,
        content: `<p><strong>${model.id}</strong></p><p>Pipeline: ${pipelineTag}</p><p>⬇️ ${downloads.toLocaleString()} downloads &nbsp; ❤️ ${likes} likes</p><p><a href="${modelUrl}">View on Hugging Face →</a></p>`,
        category: categoryMap[pipelineTag] || "ai",
        tags,
        publicationDate: model.createdAt || today,
        imageUrl: null,
        importanceScore: Math.min(100, Math.round(Math.log2(downloads + 1) * 5)),
        companies: [],
        technologies: [pipelineTag].filter(Boolean),
        processed: true,
      });
      existingUrls.add(modelUrl);
      added++;
    }
  } catch (err) {
    console.error("HF fetch error:", err);
  }

  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2));
  console.log(`Added ${added} Hugging Face models`);
}

main().catch(console.error);
