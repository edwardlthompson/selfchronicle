import type { VaultMeta } from "./types";

type SnapTarget = { files: Map<string, string>; meta: VaultMeta | null };

export function exportVaultFiles(v: SnapTarget): Record<string, string> {
  return Object.fromEntries(v.files);
}

export function importVaultFiles(
  v: SnapTarget,
  files: Record<string, string>,
  meta?: VaultMeta | null,
): void {
  v.files.clear();
  for (const [k, val] of Object.entries(files)) v.files.set(k, val);
  if (meta) v.meta = meta;
}

export function readVaultMeta(v: SnapTarget): VaultMeta | null {
  return v.meta;
}
