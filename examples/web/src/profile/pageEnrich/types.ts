/** User-initiated enrichment of public profile URLs the user already linked. */

export type PageFetchResult =
  | { ok: true; url: string; html: string }
  | { ok: false; url: string; error: string };

export type EnrichedPageSignals = {
  url: string;
  displayName?: string;
  occupations: string[];
  creditSamples: string[];
  fetchError?: string;
};

export type EnrichLinkedPagesResult = {
  attempted: number;
  enriched: number;
  failed: number;
  evidenceTitles: string[];
  summary: string;
};
