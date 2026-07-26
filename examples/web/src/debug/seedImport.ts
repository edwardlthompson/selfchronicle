import { applySeedBundle } from "../profile/applySeed";
import { memoryDisclosureAdapter } from "../import/adapters/memoryDisclosure";
import { commitImportReview } from "../import/commit";
import type { ProfileVault } from "../vault";
import { parseSeedPackJson } from "../welcome/outletPacks";

const REVERSE_PACK_URL =
  "http://127.0.0.1:9999/selfchronicle-grok-pack.json";
const REVERSE_GROK_MD =
  "http://127.0.0.1:9999/Memory_Disclosure_Report_Grok.md";
const REVERSE_GEMINI_MD =
  "http://127.0.0.1:9999/memory_disclosure_report_Gemini.md";

function debugSeedEnabled(): boolean {
  return import.meta.env.VITE_DEBUG_SEED_IMPORT === "true";
}

function debugSeedParam(): string | null {
  return new URLSearchParams(window.location.search).get("debugSeed");
}

function reverseSeedRequested(): boolean {
  return debugSeedParam() === "adb-reverse";
}

function reverseDisclosureRequested(): boolean {
  return debugSeedParam() === "disclosure";
}

function evidenceHasTag(
  evidence: Awaited<ReturnType<ProfileVault["listEvidence"]>>,
  tag: string,
): boolean {
  return evidence.some((doc) => doc.frontmatter.tags.includes(tag));
}

async function fetchAndCommitDisclosure(
  vault: ProfileVault,
  url: string,
  label: string,
): Promise<number> {
  console.info(`[debug-seed] fetching ${label} disclosure from`, url);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    console.warn(`[debug-seed] ${label} fetch failed`, res.status, res.statusText);
    return 0;
  }
  const raw = await res.text();
  const review = await memoryDisclosureAdapter.parse(raw);
  const { committed } = await commitImportReview(vault, review);
  console.info(`[debug-seed] ${label} disclosure imported`, committed, "facts", review.layerFacts?.length ?? 0);
  return committed;
}

/** Debug-only: import memory disclosure .md over adb reverse (non-destructive). */
export async function maybeDebugDisclosureImport(vault: ProfileVault): Promise<boolean> {
  if (!debugSeedEnabled() && !reverseDisclosureRequested()) return false;

  const evidence = await vault.listEvidence();
  const needGrok = !evidenceHasTag(evidence, "grok_memory");
  const needGemini = !evidenceHasTag(evidence, "gemini_memory");
  if (!needGrok && !needGemini) return false;

  let imported = 0;
  if (needGrok) {
    imported += await fetchAndCommitDisclosure(vault, REVERSE_GROK_MD, "grok");
  } else {
    console.info("[debug-seed] grok disclosure already present — skip");
  }
  if (needGemini) {
    imported += await fetchAndCommitDisclosure(vault, REVERSE_GEMINI_MD, "gemini");
  } else {
    console.info("[debug-seed] gemini disclosure already present — skip");
  }
  return imported > 0;
}

/** Debug-only: pull Grok pack over adb reverse (host serves Downloads on :9999). */
export async function maybeDebugSeedImport(vault: ProfileVault): Promise<boolean> {
  const disclosureImported = await maybeDebugDisclosureImport(vault);
  if (reverseDisclosureRequested()) return disclosureImported;
  if (!debugSeedEnabled() && !reverseSeedRequested()) return false;
  if ((await vault.listEvidence()).length > 0) return false;

  const url = REVERSE_PACK_URL;
  console.info("[debug-seed] fetching pack from", url);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    console.warn("[debug-seed] fetch failed", res.status, res.statusText);
    return false;
  }
  const raw = await res.text();
  const bundle = parseSeedPackJson(raw);
  const counts = await applySeedBundle(vault, bundle);
  console.info("[debug-seed] imported", counts);
  return true;
}
