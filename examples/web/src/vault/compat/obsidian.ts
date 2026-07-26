/** Obsidian / Logseq frontmatter compatibility helpers. */

export type CompatFrontmatter = {
  id?: string;
  title?: string;
  tags: string[];
  aliases: string[];
  created?: string;
  updated?: string;
};

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

function parseList(raw: string): string[] {
  const v = unquote(raw);
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((p) => unquote(p.trim())).filter(Boolean);
  }
  return v ? [v] : [];
}

/** Map common Obsidian keys into a SelfChronicle-friendly shape. */
export function parseObsidianFrontmatter(markdown: string): {
  data: CompatFrontmatter;
  body: string;
} {
  const m = FM_RE.exec(markdown);
  if (!m) return { data: { tags: [], aliases: [] }, body: markdown };
  const block = m[1] ?? "";
  const body = m[2] ?? "";
  const data: CompatFrontmatter = { tags: [], aliases: [] };

  for (const line of block.split(/\r?\n/)) {
    const top = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!top) continue;
    const key = top[1]!;
    const rest = (top[2] ?? "").trim();
    if (key === "tags" || key === "tag") data.tags = parseList(rest);
    else if (key === "aliases" || key === "alias") data.aliases = parseList(rest);
    else if (key === "id") data.id = unquote(rest);
    else if (key === "title") data.title = unquote(rest);
    else if (key === "created" || key === "created_at") data.created = unquote(rest);
    else if (key === "updated" || key === "updated_at") data.updated = unquote(rest);
  }
  return { data, body };
}

export function toSelfChronicleTags(data: CompatFrontmatter): string[] {
  return [...new Set([...data.tags, ...data.aliases.map((a) => `alias:${a}`)])];
}
