import type { ImportAdapter, ParsedItem } from "../../types";
import { asArray, thinReview } from "../shared";

const KNOWN = ["conversations", "messages", "title", "id", "createTime"] as const;

export const geminiAdapter: ImportAdapter = {
  sourceKey: "gemini_export",
  parser_version: "gemini_takeout_v1",
  guideSteps: [
    "Google Takeout → select Gemini / Bard activity",
    "Download and unzip on this device",
    "Paste activity JSON into Import → Gemini",
  ],
  async parse(raw: string) {
    const data = JSON.parse(raw) as unknown;
    const root = data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : undefined;
    const items: ParsedItem[] = asArray(data).map((row, i) => {
      const c = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
      return {
        title: String(c.title ?? `Gemini chat ${i + 1}`),
        body: String(c.text ?? c.prompt ?? JSON.stringify(c).slice(0, 2000)),
        source_id: c.id != null ? String(c.id) : undefined,
        occurred_at: typeof c.createTime === "string" ? c.createTime : undefined,
      };
    });
    return thinReview({
      sourceKey: geminiAdapter.sourceKey,
      parser_version: geminiAdapter.parser_version,
      knownKeys: KNOWN,
      items,
      root,
    });
  },
};
