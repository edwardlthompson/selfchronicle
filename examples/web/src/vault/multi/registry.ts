export type VaultRef = { id: string; name: string; rootUri: string };

const KEY = "sc.vaults";

export function listVaults(): VaultRef[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as VaultRef[]) : [];
  } catch {
    return [];
  }
}

export function upsertVault(ref: VaultRef): VaultRef[] {
  const next = [...listVaults().filter((v) => v.id !== ref.id), ref];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function biographyDiff(before: string, after: string): { added: number; removed: number } {
  const a = before.split(/\s+/).filter(Boolean);
  const b = after.split(/\s+/).filter(Boolean);
  return {
    added: Math.max(0, b.length - a.length),
    removed: Math.max(0, a.length - b.length),
  };
}
