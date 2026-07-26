import type { ProfileVault } from "../../vault";
import { distillAndPersistBio } from "../bioVault";
import { collectEnrichableUrls } from "./collectUrls";
import { fetchPublicPage } from "./fetchPage";
import { formatPageEnrichEvidence } from "./formatEvidence";
import { parseImdbNameHtml } from "./parseImdbHtml";
import type { EnrichLinkedPagesResult, EnrichedPageSignals } from "./types";

function enrichableTextsFromVault(
  evidence: Awaited<ReturnType<ProfileVault["listEvidence"]>>,
  bioLinks: string[],
): string[] {
  return [...evidence.map((e) => e.body), ...bioLinks];
}

function parseEnrichedUrl(url: string, html: string | null, fetchError?: string): EnrichedPageSignals {
  const parsed = html ? parseImdbNameHtml(html) : { occupations: [], creditSamples: [] };
  return {
    url,
    displayName: parsed.displayName,
    occupations: parsed.occupations,
    creditSamples: parsed.creditSamples,
    fetchError,
  };
}

function evidenceTitleForUrl(url: string): string {
  const id = url.match(/\/name\/([a-z0-9_-]+)/i)?.[1] ?? "profile";
  return `IMDb public page enrich (${id})`;
}

function hasFreshEnrichEvidence(
  evidence: Awaited<ReturnType<ProfileVault["listEvidence"]>>,
  url: string,
): boolean {
  return evidence.some(
    (doc) =>
      doc.frontmatter.tags.includes("page_enrich") &&
      doc.body.includes(`Source URL: ${url}`) &&
      !/fetch_failed/.test(doc.body),
  );
}

export type EnrichLinkedPagesOptions = {
  fetchImpl?: typeof fetch;
  skipUrls?: string[];
  force?: boolean;
};

/**
 * User-initiated enrichment of public profile pages linked in the vault.
 * Requires explicit UI consent — never call automatically on profile load.
 */
export async function enrichLinkedPagesFromVault(
  vault: ProfileVault,
  opts: EnrichLinkedPagesOptions = {},
): Promise<EnrichLinkedPagesResult> {
  const evidence = await vault.listEvidence();
  const bio = await distillAndPersistBio(vault);
  const urls = collectEnrichableUrls(enrichableTextsFromVault(evidence, bio.links));
  const skip = new Set(opts.skipUrls ?? []);
  const targets = urls.filter((u) => !skip.has(u) && (opts.force || !hasFreshEnrichEvidence(evidence, u)));

  if (!targets.length) {
    return {
      attempted: 0,
      enriched: 0,
      failed: 0,
      evidenceTitles: [],
      summary: "no_enrichable_urls",
    };
  }

  const fetchImpl = opts.fetchImpl ?? fetch;
  const fetchedAt = new Date().toISOString();
  let enriched = 0;
  let failed = 0;
  const evidenceTitles: string[] = [];

  for (const url of targets) {
    const fetched = await fetchPublicPage(url, fetchImpl);
    const signals = parseEnrichedUrl(url, fetched.ok ? fetched.html : null, fetched.ok ? undefined : fetched.error);
    await vault.appendEvidence({
      title: evidenceTitleForUrl(url),
      body: formatPageEnrichEvidence(signals, fetchedAt),
      tags: ["page_enrich", "user_initiated", "provisional", "imdb"],
      source: "other_archive",
      channel: "other",
    });
    evidenceTitles.push(evidenceTitleForUrl(url));
    if (fetched.ok && (signals.occupations.length || signals.creditSamples.length)) enriched += 1;
    else failed += 1;
  }

  await distillAndPersistBio(vault);

  const summary =
    enriched > 0
      ? `enriched_${enriched}_of_${targets.length}`
      : failed === targets.length
        ? "fetch_failed_link_inference_retained"
        : `partial_${enriched}_of_${targets.length}`;

  return {
    attempted: targets.length,
    enriched,
    failed,
    evidenceTitles,
    summary,
  };
}

/** Preview enrichable URLs without fetching (for consent UI). */
export async function listEnrichableProfileUrls(vault: ProfileVault): Promise<string[]> {
  const evidence = await vault.listEvidence();
  const bio = await distillAndPersistBio(vault);
  return collectEnrichableUrls(enrichableTextsFromVault(evidence, bio.links));
}
