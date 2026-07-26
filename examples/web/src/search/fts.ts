import type { SearchHit, VaultPort } from "../vault";

export async function searchVault(vault: VaultPort, query: string): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  return vault.search(q);
}

export function highlightQuery(title: string, query: string): string {
  const q = query.trim();
  if (!q) return title;
  const i = title.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return title;
  return `${title.slice(0, i)}«${title.slice(i, i + q.length)}»${title.slice(i + q.length)}`;
}
