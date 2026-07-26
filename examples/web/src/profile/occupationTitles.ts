import { isBioNoise } from "./bioCompactNoise";
import {
  canonicalizeTitle,
  scanProseRoles,
  splitOccupationCompound,
  stripOccupationClause,
} from "./occupationTitlesRules";

export {
  stripOccupationClause,
  splitOccupationCompound,
  canonicalizeTitle,
  scanProseRoles,
} from "./occupationTitlesRules";

/** Soft cap for short occupation chips in identity header and stored bio lists. */
export const OCCUPATION_DISPLAY_CAP = 25;

const SOURCE_NOISE_PATTERNS: RegExp[] = [
  /searched\s+for/i,
  /\bsearch(?:ed|ing)?\s+(?:for|query|term)/i,
  /research(?:ed|ing)?\s+(?:about|on|into|thread)/i,
  /^Portable Unified/i,
  /\bconversation\s+title\b/i,
  /\bgrok\s+(?:chat|thread|memory dump)\b/i,
  /\bchatgpt\b/i,
  /\bthread\s+about\b/i,
  /\bevidence\s+dump\b/i,
  /\bmemory\s+disclosure\s+report\b/i,
  /^how (?:do|to|can|does)\b/i,
  /^what (?:is|are|was|were)\b/i,
  /^why (?:do|does|is|are)\b/i,
  /^where (?:is|are|can)\b/i,
];

function isOccupationSourceNoise(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (SOURCE_NOISE_PATTERNS.some((re) => re.test(t))) return true;
  if (t.length <= 80 && isBioNoise(t)) return true;
  return false;
}

function isValidChipTitle(title: string): boolean {
  if (!title || title.length > 40) return false;
  if (/\bthe user\b|##|https?:\/\/|^\*\s|operates within|monospaced|high-contrast|\.\s*\*/i.test(title)) {
    return false;
  }
  if (title.length < 3 || /^off$/i.test(title)) return false;
  if (/^[A-Z][a-z]+\.[a-z]/i.test(title)) return false;
  return true;
}

function looksLikeCompoundList(raw: string): boolean {
  const t = raw.trim();
  if (t.length > 120) return false;
  if (/^[-*•]|\*\*The user\*\*/i.test(t)) return false;
  if (/\bthe user is\b/i.test(t)) return false;
  if (t.length <= 80 && /,\s*\S/.test(t)) return true;
  return /(?:\/|;|\s+and\s+|\s*&\s*)/i.test(t);
}

function addFromParts(raw: string, add: (title: string) => void): void {
  if (!looksLikeCompoundList(raw)) {
    const short = stripOccupationClause(raw);
    if (!short) return;
    if (short.length <= 48 && !/\bat\s/i.test(short)) add(short);
    return;
  }

  for (const part of splitOccupationCompound(raw)) {
    if (!part) continue;
    if (part.length > 48 || /\bat\s/i.test(part)) scanProseRoles(part, add);
    else add(part);
  }
}

/** Normalize one raw string into one or more concise occupation titles. */
export function extractOccupationTitles(text: string): string[] {
  const trimmed = text.trim();
  if (isOccupationSourceNoise(trimmed)) return [];

  const seen = new Set<string>();
  const out: string[] = [];
  const add = (title: string) => {
    const canon = canonicalizeTitle(title);
    if (!canon || isBioNoise(canon) || !isValidChipTitle(canon)) return;
    const key = canon.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(canon);
  };

  scanProseRoles(trimmed, add);
  addFromParts(trimmed, add);

  return out;
}

/** Flatten and dedupe occupation titles from multiple raw strings. */
export function flattenOccupationTitles(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    for (const title of extractOccupationTitles(raw)) {
      const key = title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(title);
    }
  }
  return out;
}
