import type { IdentityPatch } from "./identityPatch";
import type { BioFieldKey, ProfileBio } from "./bioModel";
import { isBioNoise, isSpokenLanguage } from "./bioCompactNoise";
import { flattenOccupationTitles, OCCUPATION_DISPLAY_CAP } from "./occupationTitles";

export { isBioNoise, isSpokenLanguage } from "./bioCompactNoise";

export const BIO_LIMITS = {
  occupations: OCCUPATION_DISPLAY_CAP,
  links: 4,
  languages: 3,
  bioBlurb: 400,
  scalar: 120,
  listItem: 80,
} as const;

function trimScalar(value: string, max = BIO_LIMITS.scalar): string {
  const t = value.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function linkScore(url: string): number {
  const u = url.toLowerCase();
  if (/github\.com\/[^/?#]+\/?$/.test(u)) return 100;
  if (/x\.com\/[^/?#]+|twitter\.com\/[^/?#]+/.test(u)) return 90;
  if (/linkedin\.com\/in\//.test(u)) return 75;
  if (/raw\.githubusercontent|api\.|\/docs\.|google\.com\/search|duckduckgo\.com/.test(u)) return -10;
  return 40;
}

export function prioritizeLinks(links: string[]): string[] {
  const seen = new Set<string>();
  const ranked = links
    .map((u) => u.trim())
    .filter(Boolean)
    .filter((u) => {
      const key = u.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return linkScore(u) >= 0;
    })
    .sort((a, b) => linkScore(b) - linkScore(a));
  return ranked.slice(0, BIO_LIMITS.links);
}

export function filterOccupations(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of flattenOccupationTitles(items)) {
    if (!item || isBioNoise(item) || /https?:\/\//i.test(item)) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= BIO_LIMITS.occupations) break;
  }
  return out;
}

export function filterLanguages(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const item = raw.trim();
    if (!isSpokenLanguage(item)) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= BIO_LIMITS.languages) break;
  }
  return out;
}

export function trimBioBlurb(text: string | undefined): string {
  if (!text?.trim()) return "";
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= BIO_LIMITS.bioBlurb) return t;
  const cut = t.slice(0, BIO_LIMITS.bioBlurb);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 200 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/** Compact a distilled identity patch before merge/persist. */
export function compactIdentityPatch(patch: IdentityPatch): IdentityPatch {
  const out: IdentityPatch = { ...patch };
  for (const key of ["displayName", "preferredName", "homeAddress", "email", "phone"] as const) {
    const v = out[key];
    if (typeof v === "string" && v.trim()) out[key] = trimScalar(v);
  }
  if (typeof out.dateOfBirth === "string" && out.dateOfBirth.trim()) {
    out.dateOfBirth = out.dateOfBirth.trim().slice(0, 32);
  }
  if (out.links?.length) out.links = prioritizeLinks(out.links);
  if (out.occupations?.length) out.occupations = filterOccupations(out.occupations);
  if (out.languages?.length) out.languages = filterLanguages(out.languages);
  if (out.bioBlurb) out.bioBlurb = trimBioBlurb(out.bioBlurb);
  return out;
}

function isFieldEdited(bio: ProfileBio, key: BioFieldKey): boolean {
  return bio.user_edited || bio.edited_fields.includes(key);
}

/** Prune stored bio lists/scalars on load; honor user-edited fields. */
export function compactProfileBio(bio: ProfileBio): ProfileBio {
  const out: ProfileBio = { ...bio };
  for (const key of ["displayName", "preferredName", "homeAddress", "email", "phone"] as const) {
    if (!isFieldEdited(bio, key) && out[key]?.trim()) out[key] = trimScalar(out[key]);
  }
  if (!isFieldEdited(bio, "bioBlurb") && out.bioBlurb) out.bioBlurb = trimBioBlurb(out.bioBlurb);
  if (!isFieldEdited(bio, "links")) out.links = prioritizeLinks(out.links);
  if (!isFieldEdited(bio, "occupations")) out.occupations = filterOccupations(out.occupations);
  if (!isFieldEdited(bio, "languages")) out.languages = filterLanguages(out.languages);
  return out;
}
