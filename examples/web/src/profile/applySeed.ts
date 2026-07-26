import type { ProfileVault } from "../vault";
import { distillAndPersistBio } from "./bioVault";
import type { SeedBundle } from "./seedBundle";

/** Commit a reviewed seed bundle into the local vault (Evidence + layers). */
export async function applySeedBundle(
  vault: ProfileVault,
  bundle: SeedBundle,
): Promise<{ evidence: number; facts: number; chapters: number }> {
  let evidence = 0;
  let facts = 0;
  let chapters = 0;
  for (const ev of bundle.evidence) {
    await vault.appendEvidence(ev);
    evidence += 1;
  }
  for (const ch of bundle.chapters) {
    await vault.upsertLayer("biography", ch.title, ch.body);
    chapters += 1;
  }
  for (const fact of bundle.facts) {
    await vault.upsertLayer("facts", fact.title, fact.body);
    facts += 1;
  }
  await distillAndPersistBio(vault);
  return { evidence, facts, chapters };
}
