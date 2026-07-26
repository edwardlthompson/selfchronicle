import type { ImportAdapter } from "../../types";
import { asArray, thinReview } from "../shared";

export const discordAdapter: ImportAdapter = {
  sourceKey: "discord_export",
  parser_version: "discord_json_v1",
  guideSteps: ["Export Discord channel/DM JSON via official tools", "Review → Commit"],
  async parse(raw: string) {
    const data = JSON.parse(raw) as unknown;
    const items = asArray(data).map((row, i) => {
      const m = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
      return {
        title: String(m.channel_name ?? `Discord ${i + 1}`),
        body: String(m.content ?? JSON.stringify(m).slice(0, 1500)),
      };
    });
    return thinReview({
      sourceKey: discordAdapter.sourceKey,
      parser_version: discordAdapter.parser_version,
      knownKeys: ["messages", "content", "channel_name"],
      items,
      root: data && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : undefined,
    });
  },
};
