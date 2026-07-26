import type { ImportReview, ParsedItem } from "../types";
import { makeSidecar, type UnknownSidecar } from "../versioning";

export type ThinParseOpts = {
  sourceKey: string;
  parser_version: string;
  knownKeys: readonly string[];
  items: ParsedItem[];
  root?: Record<string, unknown>;
};

export function thinReview(opts: ThinParseOpts): ImportReview & { sidecar?: UnknownSidecar } {
  const sidecar = opts.root
    ? makeSidecar(opts.parser_version, opts.root, opts.knownKeys)
    : undefined;
  return {
    adapter: opts.sourceKey,
    parser_version: opts.parser_version,
    count: opts.items.length,
    sampleTitles: opts.items.slice(0, 5).map((i) => i.title),
    items: opts.items,
    ...(sidecar && Object.keys(sidecar.unknown_fields).length ? { sidecar } : {}),
  };
}

export function asArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const k of ["conversations", "messages", "chats", "items", "threads"]) {
      if (Array.isArray(o[k])) return o[k] as unknown[];
    }
  }
  return [];
}
