import type { APIRoute } from "astro";
import { getAllArticles, getSources, getTrendTopics } from "../../lib/data";

export const GET: APIRoute = ({ url }) => {
  const category = url.searchParams.get("category");
  const source = url.searchParams.get("source");
  const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "20"));
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const since = url.searchParams.get("since");

  let articles = getAllArticles();

  if (category) articles = articles.filter((a) => a.category === category);
  if (source) articles = articles.filter((a) => a.source === source);
  if (since) {
    const sinceDate = new Date(since).getTime();
    articles = articles.filter((a) => new Date(a.publicationDate).getTime() >= sinceDate);
  }

  articles.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());

  const total = articles.length;
  articles = articles.slice(offset, offset + limit);

  return new Response(
    JSON.stringify({
      total,
      limit,
      offset,
      articles: articles.map((a) => ({
        id: a.id,
        title: a.title,
        url: a.url,
        source: a.source,
        category: a.category,
        excerpt: a.excerpt,
        tags: a.tags,
        publicationDate: a.publicationDate,
        importanceScore: a.importanceScore,
        author: a.author,
        deepwireUrl: `https://deepwire.ai/story/${a.id}`,
      })),
      meta: {
        sources: getSources().length,
        trends: getTrendTopics().slice(0, 10),
      },
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "max-age=300",
      },
    }
  );
};
