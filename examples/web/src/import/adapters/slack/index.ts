import type { ImportAdapter } from "../../types";
import { asArray, thinReview } from "../shared";

export const slackAdapter: ImportAdapter = {
  sourceKey: "slack_export",
  parser_version: "slack_json_v1",
  guideSteps: ["Use Slack workspace export ZIP → messages JSON", "Review → Commit"],
  async parse(raw: string) {
    const data = JSON.parse(raw) as unknown;
    const items = asArray(data).map((row, i) => {
      const m = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
      return {
        title: String(m.channel ?? `Slack ${i + 1}`),
        body: String(m.text ?? JSON.stringify(m).slice(0, 1500)),
      };
    });
    return thinReview({
      sourceKey: slackAdapter.sourceKey,
      parser_version: slackAdapter.parser_version,
      knownKeys: ["messages", "text", "channel"],
      items,
      root: data && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : undefined,
    });
  },
};
