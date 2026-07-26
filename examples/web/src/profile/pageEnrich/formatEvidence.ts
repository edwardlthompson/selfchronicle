import type { EnrichedPageSignals } from "./types";

/** Provisional evidence body for a user-initiated page enrichment result. */
export function formatPageEnrichEvidence(signals: EnrichedPageSignals, fetchedAt: string): string {
  const lines = [
    "User-initiated page enrichment (provisional). You chose to fetch a public URL you already linked.",
    "Nothing is scraped in the background.",
    "",
    `Source URL: ${signals.url}`,
    `Fetched at: ${fetchedAt}`,
    signals.fetchError ? `Status: fetch_failed (${signals.fetchError})` : "Status: ok",
    "",
    "## Distilled biography signals",
  ];
  if (signals.displayName) lines.push(`- Display name: **${signals.displayName}**`);
  if (signals.occupations.length) {
    lines.push(`- Professions (public page): ${signals.occupations.join(", ")}`);
  }
  if (signals.creditSamples.length) {
    lines.push(`- Sample credits (actor): ${signals.creditSamples.join("; ")}`);
  }
  if (signals.fetchError) {
    lines.push("- Link-only inference retained (Actor from IMDb profile URL when present).");
  }
  return lines.join("\n");
}
