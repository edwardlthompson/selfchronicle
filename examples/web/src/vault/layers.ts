import { coerceFrontmatter, parseFrontmatter, serializeDocument } from "./frontmatter";
import { newVaultId } from "./ids";
import type { VaultDocument, VaultFrontmatter } from "./types";
import { VAULT_PATHS } from "./types";

export type LayerKind = "facts" | "biography";

export function layerDir(kind: LayerKind): string {
  return kind === "facts" ? VAULT_PATHS.facts : VAULT_PATHS.biography;
}

export function buildLayerDoc(
  kind: LayerKind,
  title: string,
  body: string,
  evidenceIds: string[] = [],
): { path: string; markdown: string; doc: VaultDocument } {
  const now = new Date().toISOString();
  const type = kind === "facts" ? "fact" : "biography_chapter";
  const id = newVaultId(type);
  const fm: VaultFrontmatter = {
    id,
    type,
    title,
    created_at: now,
    updated_at: now,
    ingested_at: now,
    tags: [kind],
    status: "active",
    user_edited: true,
    provenance: { source: "manual", confidence: 1 },
    links: { evidence: evidenceIds, facts: [], attachments: [] },
  };
  const path = `${layerDir(kind)}/${id}.md`;
  const markdown = serializeDocument(fm, body);
  return { path, markdown, doc: { frontmatter: fm, body, path } };
}

export function parseLayerFile(path: string, markdown: string): VaultDocument {
  const { data, body } = parseFrontmatter(markdown);
  return { frontmatter: coerceFrontmatter(data), body, path };
}

/** Anniversary key MM-DD from ISO timestamp. */
export function monthDayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}
