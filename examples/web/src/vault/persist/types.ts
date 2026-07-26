import type { VaultMeta } from "../types";

/** Serializable vault state for IndexedDB + Drive pack sync. */
export type VaultSnapshot = {
  schema_version: 1;
  files: Record<string, string>;
  layers: Record<string, string>;
  meta: VaultMeta | null;
};

export const SNAPSHOT_SCHEMA_VERSION = 1 as const;

export function emptySnapshot(): VaultSnapshot {
  return { schema_version: SNAPSHOT_SCHEMA_VERSION, files: {}, layers: {}, meta: null };
}
