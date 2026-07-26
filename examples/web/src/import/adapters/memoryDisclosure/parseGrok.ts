import type { IdentityPatch } from "../../../profile/identityPatch";
import { extractOccupationTitles } from "../../../profile/occupationTitles";

export function grokMemoryBlock(raw: string): string {
  const m = raw.match(/### Verbatim contents of memory\.md\s*```([\s\S]*?)```/i);
  return m?.[1]?.trim() ?? "";
}

export function grokInjectedTable(raw: string): IdentityPatch {
  const patch: IdentityPatch = {};
  const name = raw.match(/\|\s*Display Name\s*\|\s*([^|]+)\|/i);
  if (name?.[1]) patch.displayName = name[1].trim();
  const handle = raw.match(/\|\s*X User Handle\s*\|\s*([^|]+)\|/i);
  if (handle?.[1]) patch.links = [`https://x.com/${handle[1].trim().replace(/^@/, "")}`];
  const loc = raw.match(/\|\s*Location\s*\|\s*([^|(]+)/i);
  if (loc?.[1]) patch.homeAddress = loc[1].replace(/\s*\(.*$/, "").trim();
  return patch;
}

export function parseGrokBullets(block: string): IdentityPatch {
  const patch: IdentityPatch = {};
  const name = block.match(/\*\*Name:\*\*\s*([^\n[]+)/i);
  if (name?.[1]) {
    const n = name[1].trim();
    patch.displayName = n.split("(")[0]!.trim();
    const gh = n.match(/GitHub:\s*(\S+)/i);
    if (gh?.[1]) patch.links = [`https://github.com/${gh[1].replace(/[;,]$/, "")}`];
    const site = n.match(/(?:personal site[^:]*:|site[^:]*:)\s*([a-z0-9.-]+\.[a-z]{2,})/i);
    if (site?.[1]) patch.links = [...(patch.links ?? []), `https://${site[1]}`];
  }
  const ageMatch = block.match(
    /\*\*Age\s*\/?\s*Birthday:\*\*\s*(\d+)\s+as of\s+([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/i,
  );
  if (ageMatch?.[1]) patch.age = Number.parseInt(ageMatch[1], 10);
  const bday = block.match(/birthday\s*~?\s*([A-Za-z]+)\s+(\d{1,2})/i);
  if (bday?.[1] && ageMatch?.[4]) {
    const months: Record<string, string> = {
      january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
      july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
    };
    const mo = months[bday[1].toLowerCase()];
    if (mo) {
      const year = Number.parseInt(ageMatch[4], 10) - (patch.age ?? 0);
      patch.dateOfBirth = `${year}-${mo}-${bday[2]!.padStart(2, "0")}`;
    }
  }
  const loc = block.match(/\*\*Location:\*\*\s*([^\n[]+)/i);
  if (loc?.[1]) patch.homeAddress = loc[1].split("(")[0]!.trim();
  const occ = block.match(/\*\*Occupation:\*\*\s*([^\n[]+)/i);
  if (occ?.[1]) patch.occupations = extractOccupationTitles(occ[1]);

  for (const section of [
    block.match(/### Experience & Career([\s\S]*?)(?=###|$)/i)?.[1],
    block.match(/## Core Interests([\s\S]*?)(?=##|$)/i)?.[1],
    block.match(/### Family & Relationships([\s\S]*?)(?=###|$)/i)?.[1],
  ]) {
    if (!section?.trim()) continue;
    patch.occupations = [...(patch.occupations ?? []), ...extractOccupationTitles(section)];
  }

  return patch;
}
