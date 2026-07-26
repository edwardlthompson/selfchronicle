export type ImportStage =
  | "guide"
  | "stage"
  | "parse"
  | "review"
  | "commit"
  | "audit";

export type ParsedItem = {
  title: string;
  body: string;
  occurred_at?: string;
  source_id?: string;
};

export type ImportReview = {
  adapter: string;
  parser_version: string;
  count: number;
  sampleTitles: string[];
  items: ParsedItem[];
  /** Optional facts to upsert on commit (memory disclosure, packs). */
  layerFacts?: { title: string; body: string }[];
  vendor?: string;
};

export interface ImportAdapter {
  sourceKey: string;
  parser_version: string;
  guideSteps: string[];
  parse(raw: string): Promise<ImportReview>;
}
