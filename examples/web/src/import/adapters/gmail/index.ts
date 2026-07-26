import type { ImportAdapter, ParsedItem } from "../../types";
import { thinReview } from "../shared";

/** Minimal MBOX: split on `From ` lines. */
export const gmailAdapter: ImportAdapter = {
  sourceKey: "gmail_takeout",
  parser_version: "mbox_v1",
  guideSteps: [
    "Google Takeout → Mail → export MBOX",
    "Download to this device",
    "Paste a small MBOX sample into Import → Gmail",
  ],
  async parse(raw: string) {
    const chunks = raw.split(/^From /m).filter((c) => c.trim());
    const items: ParsedItem[] = chunks.slice(0, 50).map((chunk, i) => {
      const subject =
        chunk.match(/^Subject:\s*(.+)$/im)?.[1]?.trim() ?? `Message ${i + 1}`;
      const date = chunk.match(/^Date:\s*(.+)$/im)?.[1]?.trim();
      return {
        title: subject.slice(0, 120),
        body: chunk.slice(0, 4000),
        occurred_at: (() => {
          if (!date) return undefined;
          const d = new Date(date);
          return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
        })(),
      };
    });
    return thinReview({
      sourceKey: gmailAdapter.sourceKey,
      parser_version: gmailAdapter.parser_version,
      knownKeys: [],
      items: items.length ? items : [{ title: "Empty MBOX", body: "_No messages_" }],
    });
  },
};
