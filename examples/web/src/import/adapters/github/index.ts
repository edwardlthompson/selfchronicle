import type { ImportAdapter } from "../../types";
import { asArray, thinReview } from "../shared";

export const githubAdapter: ImportAdapter = {
  sourceKey: "github_activity",
  parser_version: "github_activity_v1",
  guideSteps: ["Export GitHub activity JSON you own", "Review → Commit (no silent scrape)"],
  async parse(raw: string) {
    const data = JSON.parse(raw) as unknown;
    const items = asArray(data).map((row, i) => {
      const m = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
      return {
        title: String(m.type ?? m.repo ?? `GitHub event ${i + 1}`),
        body: String(m.body ?? m.title ?? JSON.stringify(m).slice(0, 1500)),
      };
    });
    return thinReview({
      sourceKey: githubAdapter.sourceKey,
      parser_version: githubAdapter.parser_version,
      knownKeys: ["type", "repo", "title", "body"],
      items,
      root: data && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : undefined,
    });
  },
};
