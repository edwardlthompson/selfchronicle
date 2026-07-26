/** Optional on-device embeddings — never leave device without export. */

export type EmbeddingRecord = { id: string; dims: number; localOnly: true };

export function embedStub(text: string): EmbeddingRecord {
  const dims = Math.min(32, Math.max(4, text.length % 32 || 8));
  return { id: `emb_${text.slice(0, 12)}`, dims, localOnly: true };
}
