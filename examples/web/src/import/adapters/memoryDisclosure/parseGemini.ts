import type { IdentityPatch } from "../../../profile/identityPatch";
import { mergePatch } from "./parseShared";
import { prioritizeLinks } from "../../../profile/bioCompact";
import { extractOccupationTitles } from "../../../profile/occupationTitles";

function geminiDemographicsBlock(raw: string): string {
  const m = raw.match(/\*\*Demographics Information\*\*\s*```([\s\S]*?)```/i);
  return m?.[1]?.trim() ?? "";
}

export function parseGeminiDemographics(block: string): IdentityPatch {
  const patch: IdentityPatch = {};
  const roles = extractOccupationTitles(block);
  if (roles.length) patch.occupations = roles;
  const name = block.match(/named\s+([A-Z][a-z]+(?:\s+[A-Z][a-z.]+)+)/i);
  if (name?.[1]) patch.displayName = name[1].replace(/\.$/, "").trim();
  const based = block.match(/based in\s+([^.,\n]+)/i);
  if (based?.[1]) patch.homeAddress = based[1].trim();
  else if (/Puerto Rico/i.test(block)) patch.homeAddress = "Puerto Rico";
  return patch;
}

export function parseGeminiInterests(raw: string): IdentityPatch {
  const patch: IdentityPatch = {};
  const block = raw.match(/\*\*Interests & Preferences\*\*\s*```([\s\S]*?)```/i)?.[1] ?? "";
  const roles = extractOccupationTitles(block);
  if (roles.length) patch.occupations = roles;
  if (/English|Spanish|bilingual/i.test(raw)) patch.languages = ["English", "Spanish"];
  const site = raw.match(/Site hint:\s*(https?:\/\/\S+)/i) ?? raw.match(/URL:\s*(https?:\/\/\S+)/i);
  if (site?.[1]) patch.links = [site[1].replace(/[.,;]+$/, "")];
  return patch;
}

export function parseGeminiReport(raw: string): IdentityPatch {
  const patch = mergePatch(parseGeminiDemographics(geminiDemographicsBlock(raw)), parseGeminiInterests(raw));
  if (patch.links?.length) patch.links = prioritizeLinks(patch.links);
  return patch;
}
