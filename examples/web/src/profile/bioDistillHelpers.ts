import type { VaultDocument } from "../vault/types";
import type { IdentityPatch } from "./identityExtract";
import type { BioInference } from "./bioModel";

export function uniqStrings(items: string[]): string[] {
  return [...new Set(items.map((s) => s.trim()).filter(Boolean))];
}

export function mergePatch(base: IdentityPatch, add: IdentityPatch): IdentityPatch {
  const out: IdentityPatch = { ...base };
  for (const [k, v] of Object.entries(add) as [keyof IdentityPatch, unknown][]) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      const prev = (out[k] as string[] | undefined) ?? [];
      out[k] = uniqStrings([...prev, ...v]) as never;
    } else if (typeof v === "string" && v.trim()) {
      if (!(out[k] as string | undefined)?.trim()) (out[k] as string) = v.trim();
    } else if (typeof v === "number" && (out[k] == null || out[k] === undefined)) {
      (out[k] as number | undefined) = v;
    }
  }
  return out;
}

export function inferFromPatch(
  patch: IdentityPatch,
  source: string,
  confidence: number,
  inferences: BioInference[],
): void {
  for (const field of [
    "displayName", "preferredName", "dateOfBirth", "age", "homeAddress", "email", "phone", "bioBlurb",
  ] as const) {
    const v = patch[field];
    if (typeof v === "string" && v.trim()) inferences.push({ field, value: v.trim(), source, confidence });
    else if (typeof v === "number") inferences.push({ field, value: v, source, confidence });
  }
  for (const field of ["links", "occupations", "languages"] as const) {
    const list = patch[field];
    if (list?.length) inferences.push({ field, value: list, source, confidence });
  }
}

export function collectSourceLabels(
  facts: VaultDocument[],
  chapters: VaultDocument[],
  evidence: VaultDocument[],
): string[] {
  const labels = new Set<string>();
  for (const e of evidence) {
    const tags = e.frontmatter.tags ?? [];
    if (tags.includes("github")) labels.add("GitHub import");
    if (tags.includes("linkslander")) labels.add("LinksLander site");
    if (tags.includes("website")) labels.add("Personal site");
    if (tags.includes("memory_disclosure") || tags.includes("grok_memory")) labels.add("Grok memory");
    if (tags.includes("gemini_memory")) labels.add("Gemini memory");
  }
  if (facts.some((f) => /Grok memory:/i.test(f.frontmatter.title))) labels.add("Grok memory");
  if (facts.some((f) => /Gemini memory:/i.test(f.frontmatter.title))) labels.add("Gemini memory");
  if (facts.some((f) => /github\s*identity/i.test(f.frontmatter.title))) labels.add("GitHub facts");
  if (facts.some((f) => /personal\s*site/i.test(f.frontmatter.title))) labels.add("Site facts");
  if (chapters.some((c) => /^Maker profile —/i.test(c.frontmatter.title))) labels.add("Biography chapter");
  if (facts.length && !labels.size) labels.add("Vault facts");
  if (evidence.length && !labels.size) labels.add("Vault evidence");
  return [...labels];
}
