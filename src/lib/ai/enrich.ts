import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface ArticleEnrichment {
  tldr: string;
  bulletSummary: string[];
  executiveSummary: string;
  technicalSummary: string;
  whyItMatters: string;
  marketImpact: string;
  technicalImpact: string;
  category: string;
  tags: string[];
  companies: string[];
  founders: string[];
  investors: string[];
  products: string[];
  technologies: string[];
  importanceScore: number;
}

const SYSTEM_PROMPT = `You are an AI news analyst. Analyze the given article and return a JSON object with:
- tldr: One sentence summary
- bulletSummary: Array of 3 key bullet points
- executiveSummary: 2-3 sentence executive overview
- technicalSummary: 1-2 sentence technical breakdown
- whyItMatters: Why this matters in the broader context
- marketImpact: Business/market implications
- technicalImpact: Technical significance
- category: One of: ai, agents, llms, robotics, startups, research, security, cloud, semiconductors, space, quantum
- tags: Array of relevant tags (max 8)
- companies: Array of companies mentioned
- founders: Array of founders mentioned
- investors: Array of investors mentioned
- products: Array of products mentioned
- technologies: Array of technologies mentioned
- importanceScore: 1-100 score based on source authority, technological significance, and industry impact`;

export async function enrichArticle(
  title: string,
  content: string,
  source: string
): Promise<ArticleEnrichment | null> {
  if (!openai) {
    return getDefaultEnrichment(title, source);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Title: ${title}\nSource: ${source}\n\nContent: ${content.slice(0, 4000)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const text = response.choices[0]?.message?.content;
    if (!text) return getDefaultEnrichment(title, source);

    return JSON.parse(text);
  } catch (error) {
    console.error("AI enrichment failed:", error);
    return getDefaultEnrichment(title, source);
  }
}

function getDefaultEnrichment(title: string, source: string): ArticleEnrichment {
  return {
    tldr: title,
    bulletSummary: [title],
    executiveSummary: title,
    technicalSummary: title,
    whyItMatters: `Reported by ${source}`,
    marketImpact: "Analysis pending",
    technicalImpact: "Analysis pending",
    category: "ai",
    tags: [source],
    companies: [],
    founders: [],
    investors: [],
    products: [],
    technologies: [],
    importanceScore: 50,
  };
}
