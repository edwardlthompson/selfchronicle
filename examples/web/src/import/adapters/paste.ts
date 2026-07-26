import type { ImportAdapter, ImportReview } from "../types";

export const pasteAdapter: ImportAdapter = {
  sourceKey: "manual_paste",
  parser_version: "manual_paste_v1",
  guideSteps: [
    "Copy text from any chat or note",
    "Paste into SelfChronicle Import",
    "Review the single item, then Commit",
  ],
  async parse(raw: string): Promise<ImportReview> {
    const body = raw.trim();
    const title = body.split("\n")[0]?.slice(0, 80) || "Pasted note";
    const items = body
      ? [{ title, body, occurred_at: new Date().toISOString() }]
      : [];
    return {
      adapter: pasteAdapter.sourceKey,
      parser_version: pasteAdapter.parser_version,
      count: items.length,
      sampleTitles: items.map((i) => i.title),
      items,
    };
  },
};
