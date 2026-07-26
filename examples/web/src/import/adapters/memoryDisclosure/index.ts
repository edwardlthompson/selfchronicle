import type { ImportAdapter, ParsedItem } from "../../types";
import { thinReview } from "../shared";
import { isMemoryDisclosureMarkdown, parseMemoryDisclosureMarkdown } from "./parse";

const BODY_MAX = 24_000;

export type MemoryDisclosureReviewExtras = {
  vendor: string;
  layerFacts: { title: string; body: string }[];
};

function truncateBody(body: string): string {
  if (body.length <= BODY_MAX) return body;
  return `${body.slice(0, BODY_MAX)}\n\n…[truncated for vault]`;
}

export const memoryDisclosureAdapter: ImportAdapter = {
  sourceKey: "memory_disclosure",
  parser_version: "memory_disclosure_md_v1",
  guideSteps: [
    "Ask Grok or Gemini for a memory disclosure report (Markdown)",
    "Save the .md file locally — it never ships in the app",
    "Vault → Import → ✦ Memory disclosure → pick file or paste → Commit",
  ],
  async parse(raw: string) {
    if (!isMemoryDisclosureMarkdown(raw)) {
      throw new Error("not_memory_disclosure_md");
    }
    const parsed = parseMemoryDisclosureMarkdown(raw);
    const vendorLabel =
      parsed.vendor === "grok" ? "Grok / xAI" : parsed.vendor === "gemini" ? "Gemini" : "LLM";
    const items: ParsedItem[] = [
      {
        title: `${vendorLabel} memory disclosure report`,
        body: truncateBody(raw),
        occurred_at: new Date().toISOString(),
      },
    ];
    const review = thinReview({
      sourceKey: memoryDisclosureAdapter.sourceKey,
      parser_version: memoryDisclosureAdapter.parser_version,
      knownKeys: ["vendor", "subject", "identity", "facts"],
      items,
    });
    return {
      ...review,
      vendor: parsed.vendor,
      layerFacts: parsed.facts,
    } as typeof review & MemoryDisclosureReviewExtras;
  },
};

export { parseMemoryDisclosureMarkdown, isMemoryDisclosureMarkdown } from "./parse";
