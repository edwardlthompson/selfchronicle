import { extractImdbProfileUrls } from "../imdbOccupationInference";

const GENERIC_URL = /https?:\/\/[^\s<>")\]|]+/gi;

/** Normalize IMDb name profile URLs for dedupe and fetch. */
export function normalizeImdbNameUrl(url: string): string {
  const m = url.trim().match(/imdb\.com\/name\/([a-z0-9_-]+)/i);
  if (!m?.[1]) return url.trim().replace(/[.,;]+$/, "");
  return `https://www.imdb.com/name/${m[1].toLowerCase()}/`;
}

/** Whether a URL is eligible for user-initiated public page enrichment. */
export function isEnrichableProfileUrl(url: string): boolean {
  return /imdb\.com\/name\/[a-z0-9_-]+/i.test(url.trim());
}

/** Collect deduped enrichable profile URLs from vault text blobs. */
export function collectEnrichableUrls(texts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const text of texts) {
    for (const raw of extractImdbProfileUrls(text)) {
      const norm = normalizeImdbNameUrl(raw);
      if (seen.has(norm)) continue;
      seen.add(norm);
      out.push(norm);
    }
    for (const match of text.matchAll(GENERIC_URL)) {
      const raw = match[0].replace(/[.,;]+$/, "");
      if (!isEnrichableProfileUrl(raw)) continue;
      const norm = normalizeImdbNameUrl(raw);
      if (seen.has(norm)) continue;
      seen.add(norm);
      out.push(norm);
    }
  }
  return out;
}
