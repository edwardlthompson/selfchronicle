import type { VaultFrontmatter, VaultItemType } from "./types";

export { serializeDocument } from "./serialize";

const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function unquote(v: string): string {
  const t = v.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

function parseScalar(raw: string): string | number | boolean | string[] {
  const v = unquote(raw);
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((p) => unquote(p.trim()));
  }
  return v;
}

/** Minimal YAML-ish frontmatter parser (flat keys + one-level nested maps). */
export function parseFrontmatter(markdown: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const m = FM_RE.exec(markdown);
  if (!m) return { data: {}, body: markdown };
  const block = m[1] ?? "";
  const body = m[2] ?? "";
  const data: Record<string, unknown> = {};
  let currentMap: Record<string, unknown> | null = null;

  for (const line of block.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const nested = /^(\s+)([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (nested && nested[1]!.length >= 2 && currentMap) {
      currentMap[nested[2]!] = parseScalar(nested[3] ?? "");
      continue;
    }
    const top = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (!top) continue;
    const key = top[1]!;
    const rest = (top[2] ?? "").trim();
    if (rest === "") {
      currentMap = {};
      data[key] = currentMap;
    } else {
      currentMap = null;
      data[key] = parseScalar(rest);
    }
  }
  return { data, body };
}

export function coerceFrontmatter(
  data: Record<string, unknown>,
  fallbackType: VaultItemType = "evidence",
): VaultFrontmatter {
  const prov = (data.provenance as Record<string, unknown> | undefined) ?? {};
  const links = (data.links as Record<string, unknown> | undefined) ?? {};
  const tags = data.tags;
  return {
    id: String(data.id ?? ""),
    type: (data.type as VaultItemType) ?? fallbackType,
    title: String(data.title ?? ""),
    created_at: String(data.created_at ?? new Date().toISOString()),
    updated_at: String(data.updated_at ?? new Date().toISOString()),
    ingested_at: String(data.ingested_at ?? new Date().toISOString()),
    tags: Array.isArray(tags) ? tags.map(String) : [],
    status: (data.status as VaultFrontmatter["status"]) ?? "active",
    user_edited: Boolean(data.user_edited),
    provenance: {
      source: (prov.source as VaultFrontmatter["provenance"]["source"]) ?? "manual",
      source_id: prov.source_id != null ? String(prov.source_id) : undefined,
      import_job_id:
        prov.import_job_id != null ? String(prov.import_job_id) : undefined,
      transformer:
        prov.transformer != null ? String(prov.transformer) : undefined,
      confidence:
        typeof prov.confidence === "number" ? prov.confidence : undefined,
    },
    links: {
      evidence: Array.isArray(links.evidence) ? links.evidence.map(String) : [],
      facts: Array.isArray(links.facts) ? links.facts.map(String) : [],
      attachments: Array.isArray(links.attachments)
        ? links.attachments.map(String)
        : [],
    },
  };
}
