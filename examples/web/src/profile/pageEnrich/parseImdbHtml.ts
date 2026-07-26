import { flattenOccupationTitles } from "../occupationTitles";

export type ImdbHtmlParse = {
  displayName?: string;
  occupations: string[];
  creditSamples: string[];
};

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function pickName(html: string): string | undefined {
  const hero = html.match(/<h1[^>]*class="[^"]*hero__title[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i);
  if (hero?.[1]) return stripHtml(hero[1]);
  const title = html.match(/<title>([^<|]+?)(?:\s*[-–|]|$)/i);
  if (title?.[1]) return stripHtml(title[1]);
  return undefined;
}

function pickProfessions(html: string): string[] {
  const block = html.match(/data-testid="profession"[\s\S]{0,1200}/i)?.[0] ?? html;
  const raw: string[] = [];
  if (/\bActor\b/i.test(block) || /\bActor\b/i.test(html)) raw.push("Actor");
  if (/\bModel\b/i.test(block) || /\bmodeling\b/i.test(html)) raw.push("Model");
  return flattenOccupationTitles(raw);
}

function pickCredits(html: string, limit = 6): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const match of html.matchAll(/data-testid="title"[^>]*>([^<]+)</gi)) {
    const title = stripHtml(match[1] ?? "").replace(/\s*\(\d{4}\)\s*$/, "").trim();
    if (!title || seen.has(title.toLowerCase())) continue;
    seen.add(title.toLowerCase());
    out.push(title);
    if (out.length >= limit) break;
  }
  return out;
}

/** Parse public IMDb name-page HTML into provisional identity signals (no network). */
export function parseImdbNameHtml(html: string): ImdbHtmlParse {
  const occupations = pickProfessions(html);
  const creditSamples = pickCredits(html);
  if (creditSamples.length && !occupations.includes("Actor")) {
    occupations.push("Actor");
  }
  return {
    displayName: pickName(html),
    occupations: flattenOccupationTitles(occupations),
    creditSamples,
  };
}
