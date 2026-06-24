import type { APIRoute } from "astro";
import { getKnowledgeGraph, getTopEntities, getNodeConnections } from "../../lib/data";

export const GET: APIRoute = ({ url }) => {
  const kg = getKnowledgeGraph();
  const entity = url.searchParams.get("entity");

  if (entity) {
    const connections = getNodeConnections(entity);
    if (!connections) {
      return new Response(JSON.stringify({ error: "Entity not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
    return new Response(JSON.stringify(connections), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "max-age=3600",
      },
    });
  }

  return new Response(
    JSON.stringify({
      totalNodes: kg.nodes.length,
      totalEdges: kg.edges.length,
      nodes: kg.nodes.slice(0, 50),
      edges: kg.edges.slice(0, 100),
      topCompanies: getTopEntities("company", 15),
      topPeople: getTopEntities("person", 15),
      topTopics: getTopEntities("topic", 15),
      topTechnologies: getTopEntities("technology", 15),
      topSources: getTopEntities("source", 15),
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "max-age=3600",
      },
    }
  );
};
