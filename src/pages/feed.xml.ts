import type { APIRoute } from "astro";
import { getAllArticles } from "../lib/data";
import { siteConfig } from "../config";

export const GET: APIRoute = () => {
  const articles = getAllArticles().slice(0, 50);

  const items = articles
    .map(
      (a) => `
    <entry>
      <title>${escapeXml(a.title)}</title>
      <link href="${siteConfig.url}/story/${a.id}"/>
      <id>${siteConfig.url}/story/${a.id}</id>
      <published>${new Date(a.publicationDate).toISOString()}</published>
      <summary type="html"><![CDATA[${a.excerpt}]]></summary>
      <category term="${a.category}"/>
      <source>${escapeXml(a.source)}</source>
    </entry>`
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteConfig.title)}</title>
  <subtitle>${escapeXml(siteConfig.description)}</subtitle>
  <link href="${siteConfig.url}/feed.xml" rel="self"/>
  <link href="${siteConfig.url}"/>
  <updated>${new Date().toISOString()}</updated>
  <id>${siteConfig.url}/</id>
  ${items}
</feed>`,
    {
      headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
    }
  );
};

function escapeXml(s: string | undefined | null): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
