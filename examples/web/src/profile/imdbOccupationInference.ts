import { flattenOccupationTitles } from "./occupationTitles";

const IMDB_NAME_URL = /https?:\/\/(?:www\.)?imdb\.com\/name\/([a-z0-9_-]+)/gi;
const IMDB_NM_TOKEN = /\bnm\d{5,10}\b/i;

/** Collect normalized IMDb name profile URLs from free text (no fetch). */
export function extractImdbProfileUrls(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const match of text.matchAll(IMDB_NAME_URL)) {
    const id = match[1]?.toLowerCase();
    if (!id) continue;
    const url = `https://www.imdb.com/name/${id}/`;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}

function hasImdbNameProfileSignal(text: string): boolean {
  if (extractImdbProfileUrls(text).length > 0) return true;
  if (!IMDB_NM_TOKEN.test(text)) return false;
  return /\bimdb\b/i.test(text);
}

function hasModelSignal(text: string): boolean {
  return (
    /\bprofessional\s+model\b/i.test(text) ||
    /\bmodel\s+actor\b|\bmodel\/actor\b/i.test(text) ||
    (/\bmodel\b/i.test(text) && /\bmodeling\b|\bcastings?\b|\bphotographer\b/i.test(text))
  );
}

/**
 * Infer occupation chips from IMDb profile links or nm#### tokens in LinksLander/evidence text.
 * No page fetch — link presence is sufficient for Actor; Model when co-mentioned in the same body.
 */
export function inferOccupationsFromImdbEvidence(text: string): string[] {
  if (!text.trim()) return [];
  const hasProfile = hasImdbNameProfileSignal(text);
  if (!hasProfile) return [];

  const raw: string[] = ["Actor"];
  if (hasModelSignal(text)) raw.push("Model");
  return flattenOccupationTitles(raw);
}
