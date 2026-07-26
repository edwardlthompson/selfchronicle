import type { ImportAdapter, ParsedItem } from "../../types";
import { asArray, thinReview } from "../shared";

const KNOWN = ["conversations", "uuid", "name", "chat_messages", "created_at"] as const;

export const claudeAdapter: ImportAdapter = {
  sourceKey: "claude_export",
  parser_version: "claude_export_v1",
  guideSteps: [
    "Claude → Settings → Privacy → Export data",
    "Download the archive when ready",
    "Paste conversations JSON into Import → Claude",
  ],
  async parse(raw: string) {
    const data = JSON.parse(raw) as unknown;
    const root = data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : undefined;
    const items: ParsedItem[] = asArray(data).map((row, i) => {
      const c = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
      const msgs = Array.isArray(c.chat_messages) ? c.chat_messages : [];
      const body = msgs
        .map((m) => {
          const msg = m as { sender?: string; text?: string };
          return `## ${msg.sender ?? "unknown"}\n\n${msg.text ?? ""}`;
        })
        .join("\n\n");
      return {
        title: String(c.name ?? `Claude chat ${i + 1}`),
        body: body || String(c.summary ?? "_Empty_"),
        source_id: c.uuid != null ? String(c.uuid) : undefined,
        occurred_at: typeof c.created_at === "string" ? c.created_at : undefined,
      };
    });
    return thinReview({
      sourceKey: claudeAdapter.sourceKey,
      parser_version: claudeAdapter.parser_version,
      knownKeys: KNOWN,
      items,
      root,
    });
  },
};
