import type { APIRoute } from "astro";
import {
  getKnowledgeGraph, getTopEntities, getNodeConnections,
  getEntityRecommendations, getGraphNeighborhood,
  searchGraphEntities, getGraphStats, getGraphTimeline
} from "../../lib/data";
import { executeCypher } from "../../lib/cypher-query";

export const GET: APIRoute = ({ url }) => {
  const kg = getKnowledgeGraph();
  const entity = url.searchParams.get("entity");
  const search = url.searchParams.get("search");
  const recommend = url.searchParams.get("recommend");
  const neighborhood = url.searchParams.get("neighborhood");
  const timeline = url.searchParams.has("timeline");
  const stats = url.searchParams.has("stats");
  const cypher = url.searchParams.get("cypher");

  if (cypher) {
    try {
      const result = executeCypher(cypher);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-cache" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: (e as Error).message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }

  if (stats) {
    return new Response(JSON.stringify(getGraphStats()), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "max-age=3600" },
    });
  }

  if (timeline) {
    return new Response(JSON.stringify(getGraphTimeline()), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "max-age=3600" },
    });
  }

  if (entity) {
    const connections = getNodeConnections(entity);
    if (!connections) {
      return new Response(JSON.stringify({ error: "Entity not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
    return new Response(
      JSON.stringify({ ...connections, recommendations: getEntityRecommendations(entity, 5) }),
      {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "max-age=3600" },
      }
    );
  }

  if (search) {
    return new Response(JSON.stringify({ results: searchGraphEntities(search) }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "max-age=3600" },
    });
  }

  if (recommend) {
    return new Response(JSON.stringify({ recommendations: getEntityRecommendations(recommend, 10) }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "max-age=3600" },
    });
  }

  if (neighborhood) {
    const depth = parseInt(url.searchParams.get("depth") || "2");
    return new Response(JSON.stringify(getGraphNeighborhood(neighborhood, depth)), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "max-age=3600" },
    });
  }

  const statsObj = getGraphStats();
  return new Response(
    JSON.stringify({
      stats: statsObj,
      nodes: kg.nodes.slice(0, 100),
      edges: kg.edges.slice(0, 200),
      topCompanies: getTopEntities("company", 15),
      topPeople: getTopEntities("person", 15),
      topTechnologies: getTopEntities("technology", 15),
      topTopics: getTopEntities("topic", 15),
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
