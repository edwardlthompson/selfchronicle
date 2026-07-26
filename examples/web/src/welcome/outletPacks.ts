import { chatgptAdapter } from "../import/adapters/chatgpt";
import { pasteAdapter } from "../import/adapters/paste";
import { getAdapterForFormat } from "../import/adapters/registry";
import type { ImportReview } from "../import/types";
import type { SeedBundle } from "../profile/seedBundle";

/** User-provided site URL only — no bundled personal profile content. */
export function buildSiteUrlBundle(siteUrl: string): SeedBundle {
  const url = siteUrl.trim();
  if (!url) throw new Error("site_url_required");
  return {
    evidence: [
      {
        title: "Personal site URL (user-provided)",
        body: [
          `User-initiated site pointer (${new Date().toISOString().slice(0, 10)}).`,
          `URL: ${url}`,
          "No page content was fetched. Add notes after commit.",
          "Source: user paste — provisional.",
        ].join("\n"),
        tags: ["website", "import", "provisional"],
        source: "other_archive",
        channel: "other",
      },
    ],
    chapters: [],
    facts: [{ title: "Personal site", body: `Public portal pointer: ${url}.` }],
  };
}

/** @deprecated Use buildSiteUrlBundle */
export const buildLinksLanderBundle = buildSiteUrlBundle;

export function seedFromReview(review: ImportReview): SeedBundle {
  return {
    evidence: review.items.map((i) => ({
      title: i.title,
      body: i.body,
      tags: ["import", review.adapter, "provisional"],
      source: "other_archive" as const,
      channel: "other" as const,
    })),
    chapters: [],
    facts: [],
  };
}

/** Accept a SeedBundle-shaped JSON pack (Drive / file) or reject. */
export function parseSeedPackJson(raw: string): SeedBundle {
  const data = JSON.parse(raw) as unknown;
  if (!data || typeof data !== "object") throw new Error("pack_invalid");
  const o = data as Record<string, unknown>;
  const evidence = Array.isArray(o.evidence) ? o.evidence : null;
  if (!evidence) throw new Error("pack_missing_evidence");
  return {
    evidence: evidence.map((e) => {
      const row = e as Record<string, unknown>;
      return {
        title: String(row.title ?? "Imported evidence"),
        body: String(row.body ?? ""),
        tags: Array.isArray(row.tags) ? row.tags.map(String) : ["import", "pack"],
        source: "other_archive" as const,
        channel: "other" as const,
      };
    }),
    chapters: Array.isArray(o.chapters)
      ? o.chapters.map((c) => {
          const row = c as Record<string, unknown>;
          return { title: String(row.title ?? "Chapter"), body: String(row.body ?? "") };
        })
      : [],
    facts: Array.isArray(o.facts)
      ? o.facts.map((f) => {
          const row = f as Record<string, unknown>;
          return { title: String(row.title ?? "Fact"), body: String(row.body ?? "") };
        })
      : [],
  };
}

export async function parseOutletPaste(
  kind: "chatgpt" | "paste",
  raw: string,
): Promise<SeedBundle> {
  const review =
    kind === "chatgpt" ? await chatgptAdapter.parse(raw) : await pasteAdapter.parse(raw);
  return seedFromReview(review);
}

export async function parseOutletByFormat(formatKey: string, raw: string): Promise<SeedBundle> {
  const adapter = getAdapterForFormat(formatKey);
  if (!adapter) throw new Error("format_unsupported");
  return seedFromReview(await adapter.parse(raw));
}
