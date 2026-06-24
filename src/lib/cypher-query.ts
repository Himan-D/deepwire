import { loadKnowledgeGraph, type KGNode, type KGEdge } from "./data";

interface MatchPattern {
  alias: string;
  label?: string;
  isEdge: boolean;
  source?: string;
  target?: string;
  relType?: string;
  directed?: boolean;
}

interface Condition {
  alias: string;
  prop: string;
  op: string;
  value: string | number;
}

interface CypherQuery {
  patterns: MatchPattern[];
  where: Condition[];
  returns: string[];
  limit: number;
}

const TOKEN_REGEX = /(?:\((\w+)(?::(\w+))?\))|(?:\[(\w*)(?::(\w+))?\])|(?:->)|(?:<-)|(?:--)|(?:WHERE|where)|(?:AND|and)|(?:RETURN|return)|(?:LIMIT|limit)|(?:(\w+)\.(\w+)\s*(=|>|<|>=|<=|!=)\s*('[^']*'|\d+))/g;

function parseCypher(query: string): CypherQuery {
  const patterns: MatchPattern[] = [];
  const where: Condition[] = [];
  const returns: string[] = [];
  let limit = Infinity;

  const tokens: string[] = [];
  let i = 0;
  while (i < query.length) {
    if (query[i] === "(") {
      const end = query.indexOf(")", i);
      if (end === -1) throw new Error("Unmatched ( in MATCH");
      tokens.push(query.slice(i, end + 1));
      i = end + 1;
    } else if (query[i] === "[") {
      const end = query.indexOf("]", i);
      if (end === -1) throw new Error("Unmatched [ in MATCH");
      tokens.push(query.slice(i, end + 1));
      i = end + 1;
    } else if (query[i] === "-" && query[i + 1] === ">" ) {
      tokens.push("->");
      i += 2;
    } else if (query[i] === "<" && query[i + 1] === "-") {
      tokens.push("<-");
      i += 2;
    } else if (query[i] === "-" && query[i + 1] === "-") {
      tokens.push("--");
      i += 2;
    } else if (/\s/.test(query[i])) {
      i++;
    } else {
      const wordEnd = query.slice(i).search(/[\s()\[\]-]/);
      const word = wordEnd === -1 ? query.slice(i) : query.slice(i, i + wordEnd);
      if (word) tokens.push(word);
      i += word.length || 1;
    }
  }

  let mode: "match" | "where" | "return" | "limit" = "match";

  for (let t = 0; t < tokens.length; t++) {
    const tok = tokens[t];

    if (/^(MATCH|match)$/.test(tok)) { mode = "match"; continue; }
    if (/^(WHERE|where)$/.test(tok)) { mode = "where"; continue; }
    if (/^(RETURN|return)$/.test(tok)) { mode = "return"; continue; }
    if (/^(LIMIT|limit)$/.test(tok)) { mode = "limit"; continue; }
    if (/^AND$/i.test(tok)) continue;

    if (mode === "match") {
      if (tok.startsWith("(")) {
        const inner = tok.slice(1, -1).trim();
        const parts = inner.split(":");
        patterns.push({
          alias: parts[0].trim(),
          label: parts[1]?.trim(),
          isEdge: false,
        });
      } else if (tok.startsWith("[")) {
        const inner = tok.slice(1, -1).trim();
        const parts = inner.split(":");
        patterns.push({
          alias: parts[0].trim() || `_e${patterns.length}`,
          relType: parts[1]?.trim(),
          isEdge: true,
        });
      } else if (tok === "->") {
        const last = patterns[patterns.length - 1];
        if (last && last.isEdge) last.directed = true;
      } else if (tok === "--") {
        const last = patterns[patterns.length - 1];
        if (last && last.isEdge) last.directed = false;
      }
    } else if (mode === "where") {
      const condMatch = tok.match(/(\w+)\.(\w+)\s*(=|>|<|>=|<=|!=)\s*('([^']*)'|(\d+))/);
      if (condMatch) {
        where.push({
          alias: condMatch[1],
          prop: condMatch[2],
          op: condMatch[3],
          value: condMatch[5] !== undefined ? condMatch[5] : Number(condMatch[6]),
        });
      }
    } else if (mode === "return") {
      if (tok !== ",") returns.push(tok);
    } else if (mode === "limit") {
      limit = parseInt(tok, 10) || Infinity;
    }
  }

  const returnAliases = returns.length > 0 ? returns : patterns.filter(p => !p.isEdge).map(p => p.alias);

  return { patterns, where, returns: returnAliases, limit };
}

function matchesCondition(node: KGNode | KGEdge, cond: Condition): boolean {
  const val = (node as any)[cond.prop];
  if (val === undefined) return false;
  const target = cond.value;

  switch (cond.op) {
    case "=": return String(val) === String(target);
    case "!=": return String(val) !== String(target);
    case ">": return Number(val) > Number(target);
    case "<": return Number(val) < Number(target);
    case ">=": return Number(val) >= Number(target);
    case "<=": return Number(val) <= Number(target);
    default: return false;
  }
}

export function executeCypher(query: string): {
  columns: string[];
  rows: Record<string, any>[];
  total: number;
  query: string;
} {
  const kg = loadKnowledgeGraph();
  const parsed = parseCypher(query);

  const nodePatterns = parsed.patterns.filter(p => !p.isEdge);
  const edgePatterns = parsed.patterns.filter(p => p.isEdge);

  let nodeResults: Record<string, KGNode>[] = [{}];
  for (const np of nodePatterns) {
    let candidates = kg.nodes;
    if (np.label) {
      candidates = candidates.filter(n => n.type === np.label);
    }
    const newResults: Record<string, KGNode>[] = [];
    for (const row of nodeResults) {
      for (const candidate of candidates) {
        if (Object.values(row).some(n => (n as KGNode).id === candidate.id)) continue;
        newResults.push({ ...row, [np.alias]: candidate });
      }
    }
    nodeResults = newResults;
    if (nodeResults.length > 5000) break;
  }

  let finalResults = nodeResults;

  if (edgePatterns.length > 0) {
    const edgeResults: Record<string, any>[] = [];
    for (const row of finalResults) {
      const ep = edgePatterns[0];
      const sourceAlias = ep.source || (ep.directed ? nodePatterns[0]?.alias : undefined);
      const targetAlias = ep.target || nodePatterns[1]?.alias;

      for (const edge of kg.edges) {
        if (ep.relType && edge.relationship !== ep.relType) continue;

        let matched = false;
        if (ep.directed === true) {
          if (sourceAlias && row[sourceAlias]) {
            if (edge.source === row[sourceAlias].id) {
              if (targetAlias && !row[targetAlias]) {
                const targetNode = kg.nodes.find(n => n.id === edge.target);
                if (targetNode) {
                  edgeResults.push({ ...row, [targetAlias]: targetNode, [ep.alias]: edge });
                  matched = true;
                }
              }
            }
          }
        } else if (ep.directed === false) {
          if (sourceAlias && row[sourceAlias]) {
            const neighborId = edge.source === row[sourceAlias].id ? edge.target :
              edge.target === row[sourceAlias].id ? edge.source : null;
            if (neighborId) {
              if (targetAlias && !row[targetAlias]) {
                const targetNode = kg.nodes.find(n => n.id === neighborId);
                if (targetNode) {
                  edgeResults.push({ ...row, [targetAlias]: targetNode, [ep.alias]: edge });
                  matched = true;
                }
              }
            }
          }
        }
        if (!matched && nodePatterns.length >= 2) {
          const s = row[nodePatterns[0].alias];
          const t = row[nodePatterns[1].alias];
          if (s && t) {
            if ((edge.source === s.id && edge.target === t.id) ||
                (!ep.directed && edge.source === t.id && edge.target === s.id)) {
              if (ep.relType && edge.relationship !== ep.relType) continue;
              edgeResults.push({ ...row, [ep.alias]: edge });
            }
          }
        }
      }
    }
    finalResults = edgeResults;
  }

  for (const cond of parsed.where) {
    finalResults = finalResults.filter(row => {
      const entity = row[cond.alias];
      if (!entity) return false;
      return matchesCondition(entity, cond);
    });
  }

  const columns = parsed.returns.length > 0
    ? parsed.returns
    : [...new Set([...nodePatterns.map(p => p.alias), ...edgePatterns.map(p => p.alias)])];

  let rows = finalResults.slice(0, parsed.limit);
  const total = finalResults.length;

  rows = rows.map(row => {
    const out: Record<string, any> = {};
    for (const col of columns) {
      const entity = row[col];
      if (entity) {
        out[col] = { id: entity.id, name: entity.name, type: entity.type, articleCount: entity.articleCount, importance: entity.importance };
      }
    }
    return out;
  });

  return { columns, rows, total, query };
}
