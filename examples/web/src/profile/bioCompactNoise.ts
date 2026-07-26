const LIST_ITEM_MAX = 80;

const NOISE_PATTERNS: RegExp[] = [
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
  /\?\s*$/,
];

const PROG_LANGS = new Set([
  "typescript",
  "javascript",
  "python",
  "rust",
  "go",
  "java",
  "kotlin",
  "swift",
  "ruby",
  "php",
  "c",
  "c++",
  "c#",
  "html",
  "css",
  "shell",
  "bash",
]);

export function isBioNoise(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (t.length > LIST_ITEM_MAX) return true;
  if (NOISE_PATTERNS.some((re) => re.test(t))) return true;
  if (PROG_LANGS.has(t.toLowerCase())) return true;
  return false;
}

export function isSpokenLanguage(text: string): boolean {
  const t = text.trim();
  if (!t || isBioNoise(t)) return false;
  if (PROG_LANGS.has(t.toLowerCase())) return false;
  if (/bytes|repository|repo|commit|github/i.test(t)) return false;
  return t.length <= 40;
}
