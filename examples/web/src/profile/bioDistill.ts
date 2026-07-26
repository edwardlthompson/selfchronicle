import type { VaultDocument } from "../vault/types";
import { computeAgeFromDob } from "./identityAge";
import type { IdentityPatch } from "./identityExtract";
import {
  extractFromBiography,
  extractFromEvidence,
  extractFromFacts,
  extractFromMemoryDisclosure,
} from "./identityExtract";
import type { BioFieldKey, BioInference } from "./bioModel";
import { collectSourceLabels, inferFromPatch, mergePatch } from "./bioDistillHelpers";
import { compactIdentityPatch } from "./bioCompact";

export type DistilledBio = {
  patch: IdentityPatch;
  inferences: BioInference[];
  sources: string[];
};

const CONF = {
  titledFact: 0.85,
  biography: 0.8,
  githubEvidence: 0.75,
} as const;

/** Scan vault layers and infer identity fields with provenance. */
export function distillBioFromVault(opts: {
  facts: VaultDocument[];
  chapters: VaultDocument[];
  evidence: VaultDocument[];
}): DistilledBio {
  const inferences: BioInference[] = [];
  const sources = collectSourceLabels(opts.facts, opts.chapters, opts.evidence);

  const factPatch = extractFromFacts(opts.facts);
  inferFromPatch(factPatch, "Key facts", CONF.titledFact, inferences);

  const bioPatch = extractFromBiography(opts.chapters);
  inferFromPatch(bioPatch, "Living biography", CONF.biography, inferences);

  const evPatch = extractFromEvidence(opts.evidence);
  inferFromPatch(evPatch, "Imported evidence", CONF.githubEvidence, inferences);

  const memPatch = extractFromMemoryDisclosure(opts.facts, opts.evidence);
  inferFromPatch(memPatch, "Memory disclosure", CONF.titledFact, inferences);

  let patch = mergePatch({}, bioPatch);
  patch = mergePatch(patch, factPatch);
  patch = mergePatch(patch, evPatch);
  patch = mergePatch(patch, memPatch);

  if (patch.dateOfBirth && patch.age == null) {
    patch.age = computeAgeFromDob(patch.dateOfBirth);
  }

  patch = compactIdentityPatch(patch);

  return { patch, inferences, sources };
}

export function patchFieldKeys(patch: IdentityPatch): BioFieldKey[] {
  const keys: BioFieldKey[] = [];
  for (const k of [
    "displayName", "preferredName", "dateOfBirth", "age", "homeAddress",
    "email", "phone", "bioBlurb", "links", "occupations", "languages",
  ] as const) {
    const v = patch[k];
    if (v == null) continue;
    if (Array.isArray(v) && v.length) keys.push(k);
    else if (typeof v === "string" && v.trim()) keys.push(k);
    else if (typeof v === "number") keys.push(k);
  }
  return keys;
}
