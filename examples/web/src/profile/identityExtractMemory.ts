import type { VaultDocument } from "../vault/types";
import type { IdentityPatch } from "./identityPatch";
import { parseMemoryDisclosureMarkdown } from "../import/adapters/memoryDisclosure/parse";
import { filterOccupations, isBioNoise, prioritizeLinks } from "./bioCompact";
import { extractOccupationTitles } from "./occupationTitles";
import { mergePatch } from "./bioDistillHelpers";

/** Extract identity from memory disclosure evidence bodies and tagged facts. */
export function extractFromMemoryDisclosure(
  facts: VaultDocument[],
  evidence: VaultDocument[],
): IdentityPatch {
  let patch: IdentityPatch = {};
  for (const ev of evidence) {
    const tags = ev.frontmatter.tags ?? [];
    if (!tags.includes("memory_disclosure") && !/memory disclosure report/i.test(ev.frontmatter.title)) {
      continue;
    }
    patch = mergePatch(patch, parseMemoryDisclosureMarkdown(ev.body).identity);
  }
  for (const fact of facts) {
    const title = fact.frontmatter.title;
    if (!/^(Grok|Gemini|LLM) memory:/i.test(title) && !/memory disclosure/i.test(title)) continue;
    const body = fact.body.trim();
    if (!body || isBioNoise(body)) continue;
    if (/^https?:\/\//i.test(body)) {
      patch.links = [...(patch.links ?? []), body.replace(/[.,;]+$/, "")];
    } else if (/^\d+$/.test(body)) {
      patch.age = Number.parseInt(body, 10);
    } else if (/occupation/i.test(title)) {
      patch.occupations = [
        ...(patch.occupations ?? []),
        ...extractOccupationTitles(body),
      ];
    } else if (/language/i.test(title)) {
      patch.languages = body.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
    } else if (/name/i.test(title) && !patch.displayName) {
      patch.displayName = body;
    } else if (/location/i.test(title) && !patch.homeAddress) {
      patch.homeAddress = body;
    } else if (/birth|dob/i.test(title)) {
      patch.dateOfBirth = body;
    }
  }
  if (patch.links) patch.links = prioritizeLinks(patch.links);
  if (patch.occupations) patch.occupations = filterOccupations(patch.occupations);
  return patch;
}
