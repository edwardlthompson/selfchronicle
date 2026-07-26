export type TrustEvent = { id: string; kind: "forget" | "repair"; targetId: string };
const forgotten = new Set<string>();
export function forget(id: string): void { forgotten.add(id); }
export function isForgotten(id: string): boolean { return forgotten.has(id); }
