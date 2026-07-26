import type { VaultDocument } from "../vault/types";
import type { IdentityPatch } from "./identityPatch";
import { isBioNoise, trimBioBlurb } from "./bioCompact";
import { extractOccupationTitles } from "./occupationTitles";

export type { IdentityPatch } from "./identityPatch";

const TITLE_RULES: { re: RegExp; field: keyof IdentityPatch }[] = [
  { re: /^(full\s*)?name|display\s*name$/i, field: "displayName" },
  { re: /preferred\s*name|nickname|goes\s*by/i, field: "preferredName" },
  { re: /date\s*of\s*birth|d\.?o\.?b\.?|birthday|born/i, field: "dateOfBirth" },
  { re: /^age$/i, field: "age" },
  { re: /home\s*address|^address$|lives\s*in|^location$|based\s*in/i, field: "homeAddress" },
  { re: /^email$|e-?mail\s*address/i, field: "email" },
  { re: /^phone$|mobile|telephone/i, field: "phone" },
  { re: /occupation|job\s*title|^work$|career/i, field: "occupations" },
  {
    re: /photograph|model(?:ing)?|acting|motorsport|tour\s+guid|racing|developer|off-?road|automotive|gaming|fisher|radio|foss|crypto|filmmak|parent|hobby|passion/i,
    field: "occupations",
  },
  { re: /^languages?$|speaks/i, field: "languages" },
  { re: /^bio$|about\s*me|biography/i, field: "bioBlurb" },
];

function splitList(body: string): string[] {
  return body
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseAgeBody(body: string): number | null {
  const n = Number.parseInt(body.trim(), 10);
  return Number.isFinite(n) && n >= 0 && n < 150 ? n : null;
}

function parseGithubFact(body: string): IdentityPatch {
  const m = body.match(
    /Uses\s+(\S+)\s+on GitHub(?:;\s*location\s+([^;]+))?(?:;\s*bio\s+[“"]([^”"]+)[”"])?/i,
  );
  if (!m) return {};
  const patch: IdentityPatch = { displayName: m[1] };
  if (m[2]?.trim()) patch.homeAddress = m[2].trim();
  return patch;
}

function assignScalar(patch: IdentityPatch, field: keyof IdentityPatch, value: string): void {
  if (field === "occupations" || field === "languages" || field === "links") return;
  if (field === "bioBlurb") {
    patch.bioBlurb = trimBioBlurb(value);
    return;
  }
  (patch as Record<string, string | number | null>)[field] = value;
}

export function extractFromFacts(facts: VaultDocument[]): IdentityPatch {
  const patch: IdentityPatch = {};
  for (const fact of facts) {
    const title = fact.frontmatter.title.trim();
    const body = fact.body.trim();
    if (!body) continue;
    if (isBioNoise(body)) continue;
    if (/github\s*identity/i.test(title)) {
      Object.assign(patch, parseGithubFact(body));
      continue;
    }
    if (/personal\s*site|website|portfolio/i.test(title)) {
      const url = body.match(/https?:\/\/[^\s]+/)?.[0];
      if (url) patch.links = [...(patch.links ?? []), url.replace(/[.,;]+$/, "")];
      continue;
    }
    for (const rule of TITLE_RULES) {
      if (!rule.re.test(title)) continue;
      if (rule.field === "occupations" || rule.field === "languages") {
        if (rule.field === "occupations") {
          const source = /^(occupation|job\s*title|work|career)$/i.test(title.trim())
            ? body
            : `${title} ${body}`;
          patch.occupations = [...(patch.occupations ?? []), ...extractOccupationTitles(source)];
        } else {
          patch[rule.field] = splitList(body).filter((s) => !isBioNoise(s));
        }
      } else if (rule.field === "bioBlurb") {
        patch.bioBlurb = trimBioBlurb(body);
      } else if (rule.field === "age") {
        patch.age = parseAgeBody(body);
      } else if (rule.field === "dateOfBirth") {
        patch.dateOfBirth = body.split(/\s/)[0] ?? body;
      } else {
        assignScalar(patch, rule.field, body);
      }
      break;
    }
  }
  return patch;
}

export function extractFromBiography(chapters: VaultDocument[]): IdentityPatch {
  const patch: IdentityPatch = {};
  for (const ch of chapters) {
    const titleMatch = ch.frontmatter.title.match(/^Maker profile — (.+)$/i);
    if (titleMatch?.[1] && !patch.displayName) patch.displayName = titleMatch[1].trim();
    const loc = ch.body.match(/^Location:\s*(.+?)\.?$/m);
    if (loc?.[1] && !patch.homeAddress) patch.homeAddress = loc[1].trim();
    const bioLine = ch.body.match(/^Bio:\s*[“"]([^”"]+)[”"]\.?$/m);
    if (bioLine?.[1] && !patch.bioBlurb) {
      patch.bioBlurb = trimBioBlurb(bioLine[1].trim());
    }
  }
  return patch;
}

export { extractFromEvidence } from "./identityExtractEvidence";
export { extractFromMemoryDisclosure } from "./identityExtractMemory";
