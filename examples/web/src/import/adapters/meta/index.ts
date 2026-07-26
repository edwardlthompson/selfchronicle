import type { ImportAdapter, ParsedItem } from "../../types";
import { asArray, thinReview } from "../shared";

const KNOWN = ["messages", "participants", "title", "thread_path"] as const;

/** Meta Download Your Information — messenger-style JSON. */
export const metaAdapter: ImportAdapter = {
  sourceKey: "meta_dyi",
  parser_version: "meta_dyi_v1",
  guideSteps: [
    "Meta → Accounts Center → Download Your Information",
    "Select Messages / Instagram DMs as needed",
    "Paste a thread JSON into Import → Meta",
  ],
  async parse(raw: string) {
    const data = JSON.parse(raw) as unknown;
    const root = data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : undefined;
    const msgs = root && Array.isArray(root.messages) ? root.messages : asArray(data);
    const title = String(root?.title ?? "Meta thread");
    const body = msgs
      .slice(0, 200)
      .map((m) => {
        const msg = m as { sender_name?: string; content?: string };
        return `## ${msg.sender_name ?? "unknown"}\n\n${msg.content ?? ""}`;
      })
      .join("\n\n");
    const items: ParsedItem[] = [
      {
        title,
        body: body || "_Empty thread_",
        source_id: root?.thread_path != null ? String(root.thread_path) : undefined,
      },
    ];
    return thinReview({
      sourceKey: metaAdapter.sourceKey,
      parser_version: metaAdapter.parser_version,
      knownKeys: KNOWN,
      items,
      root,
    });
  },
};
