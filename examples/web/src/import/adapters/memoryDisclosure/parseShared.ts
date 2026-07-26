import type { IdentityPatch } from "../../../profile/identityPatch";

export type MemoryDisclosureVendor = "grok" | "gemini" | "unknown";
export type MemoryDisclosureFact = { title: string; body: string };

export type MemoryDisclosureParse = {
  vendor: MemoryDisclosureVendor;
  subject?: string;
  identity: IdentityPatch;
  facts: MemoryDisclosureFact[];
};

export function mergePatch(a: IdentityPatch, b: IdentityPatch): IdentityPatch {
  const out: IdentityPatch = { ...a };
  for (const [k, v] of Object.entries(b) as [keyof IdentityPatch, unknown][]) {
    if (v == null) continue;
    if (Array.isArray(v)) out[k] = [...new Set([...(out[k] as string[] | undefined) ?? [], ...v])] as never;
    else if (typeof v === "string" && v.trim() && !(out[k] as string | undefined)?.trim()) {
      (out[k] as string) = v.trim();
    } else if (typeof v === "number" && out[k] == null) {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}

export function factsFromPatch(
  vendor: MemoryDisclosureVendor,
  patch: IdentityPatch,
): MemoryDisclosureFact[] {
  const prefix = vendor === "grok" ? "Grok memory" : vendor === "gemini" ? "Gemini memory" : "LLM memory";
  const facts: MemoryDisclosureFact[] = [];
  const scalar: [string, string | number | null | undefined][] = [
    ["Full name", patch.displayName],
    ["Preferred name", patch.preferredName],
    ["Date of birth", patch.dateOfBirth],
    ["Age", patch.age],
    ["Location", patch.homeAddress],
    ["Email", patch.email],
    ["Phone", patch.phone],
  ];
  for (const [title, val] of scalar) {
    if (val == null || val === "") continue;
    facts.push({ title: `${prefix}: ${title}`, body: String(val) });
  }
  if (patch.occupations?.length) facts.push({ title: "Occupation", body: patch.occupations.join("; ") });
  if (patch.languages?.length) facts.push({ title: "Languages", body: patch.languages.join(", ") });
  if (patch.links?.length) facts.push({ title: "Personal site", body: patch.links[0]! });
  return facts;
}
