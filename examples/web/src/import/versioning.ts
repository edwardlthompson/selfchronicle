/** Pin parser versions; park unknown fields in a sidecar. */

export type UnknownSidecar = {
  parser_version: string;
  unknown_fields: Record<string, unknown>;
};

export function collectUnknown(
  obj: Record<string, unknown>,
  knownKeys: readonly string[],
): Record<string, unknown> {
  const known = new Set(knownKeys);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!known.has(k)) out[k] = v;
  }
  return out;
}

export function makeSidecar(
  parser_version: string,
  obj: Record<string, unknown>,
  knownKeys: readonly string[],
): UnknownSidecar {
  return {
    parser_version,
    unknown_fields: collectUnknown(obj, knownKeys),
  };
}
