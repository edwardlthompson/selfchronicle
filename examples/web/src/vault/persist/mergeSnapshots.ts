import { parseFrontmatter } from "../frontmatter";
import type { VaultSnapshot } from "./types";
import { SNAPSHOT_SCHEMA_VERSION } from "./types";

export type MergeStats = {
  filesAdded: number;
  filesUpdated: number;
  layersAdded: number;
  layersUpdated: number;
};

/** Compare frontmatter timestamps; fallback to lexicographic markdown. */
function pickNewerMarkdown(a: string, b: string): string {
  try {
    const ta = (parseFrontmatter(a).data as { updated_at?: string }).updated_at ?? "";
    const tb = (parseFrontmatter(b).data as { updated_at?: string }).updated_at ?? "";
    if (ta && tb) return ta >= tb ? a : b;
  } catch {
    /* fall through */
  }
  return a.length >= b.length ? a : b;
}

function mergeRecordMaps(
  local: Record<string, string>,
  remote: Record<string, string>,
): { merged: Record<string, string>; added: number; updated: number } {
  const merged = { ...local };
  let added = 0;
  let updated = 0;
  for (const [path, remoteMd] of Object.entries(remote)) {
    const localMd = merged[path];
    if (!localMd) {
      merged[path] = remoteMd;
      added += 1;
      continue;
    }
    const winner = pickNewerMarkdown(localMd, remoteMd);
    if (winner !== localMd) {
      merged[path] = winner;
      updated += 1;
    }
  }
  return { merged, added, updated };
}

/**
 * Union merge: one vault truth across devices.
 * Same path → keep newer `updated_at`; unique paths from both sides kept (no silent deletes).
 */
export function mergeSnapshots(base: VaultSnapshot, incoming: VaultSnapshot): VaultSnapshot {
  const files = mergeRecordMaps(base.files ?? {}, incoming.files ?? {});
  const layers = mergeRecordMaps(base.layers ?? {}, incoming.layers ?? {});
  const meta =
    base.meta && incoming.meta
      ? base.meta.created_at <= incoming.meta.created_at
        ? base.meta
        : incoming.meta
      : (base.meta ?? incoming.meta);
  return {
    schema_version: SNAPSHOT_SCHEMA_VERSION,
    files: files.merged,
    layers: layers.merged,
    meta,
  };
}

export function mergeStats(before: VaultSnapshot, after: VaultSnapshot): MergeStats {
  const countNew = (
    prev: Record<string, string>,
    next: Record<string, string>,
  ): { added: number; updated: number } => {
    let added = 0;
    let updated = 0;
    for (const [path, md] of Object.entries(next)) {
      if (!(path in prev)) added += 1;
      else if (prev[path] !== md) updated += 1;
    }
    return { added, updated };
  };
  const f = countNew(before.files, after.files);
  const l = countNew(before.layers, after.layers);
  return {
    filesAdded: f.added,
    filesUpdated: f.updated,
    layersAdded: l.added,
    layersUpdated: l.updated,
  };
}
