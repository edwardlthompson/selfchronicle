import { coerceFrontmatter, parseFrontmatter } from "./frontmatter";
import type { VaultDocument, VaultFrontmatter } from "./types";
import { VAULT_PATHS } from "./types";

export type IndexRow = {
  id: string;
  path: string;
  title: string;
  type: VaultFrontmatter["type"];
  text: string;
};

export function buildIndexFromFiles(files: Map<string, string>): IndexRow[] {
  const index: IndexRow[] = [];
  for (const [path, markdown] of files) {
    if (!path.endsWith(".md") || path === VAULT_PATHS.meta) continue;
    const { data, body } = parseFrontmatter(markdown);
    const fm = coerceFrontmatter(data);
    if (!fm.id) continue;
    index.push({
      id: fm.id,
      path,
      title: fm.title,
      type: fm.type,
      text: `${fm.title}\n${body}`.toLowerCase(),
    });
  }
  return index;
}

export function listEvidenceDocs(files: Map<string, string>): VaultDocument[] {
  const docs: VaultDocument[] = [];
  for (const [path, markdown] of files) {
    if (!path.startsWith(`${VAULT_PATHS.evidence}/`)) continue;
    const { data, body } = parseFrontmatter(markdown);
    docs.push({ frontmatter: coerceFrontmatter(data, "evidence"), body, path });
  }
  return docs.sort((a, b) => b.frontmatter.created_at.localeCompare(a.frontmatter.created_at));
}
