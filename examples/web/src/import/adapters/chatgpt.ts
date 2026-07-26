import type { ImportAdapter, ImportReview, ParsedItem } from "../types";

/** Minimal ChatGPT export parser: conversations.json array or {mapping} objects. */
export const chatgptAdapter: ImportAdapter = {
  sourceKey: "chatgpt_export",
  parser_version: "chatgpt_export_v1",
  guideSteps: [
    "Open ChatGPT → Settings → Data controls",
    "Export data and download the zip when ready",
    "Open conversations.json from the zip",
    "Paste or drop the JSON into SelfChronicle → Import",
  ],
  async parse(raw: string): Promise<ImportReview> {
    const data = JSON.parse(raw) as unknown;
    const items: ParsedItem[] = [];
    const list = Array.isArray(data) ? data : [];
    for (const conv of list) {
      if (!conv || typeof conv !== "object") continue;
      const c = conv as Record<string, unknown>;
      const title = String(c.title ?? "ChatGPT conversation");
      const id = c.id != null ? String(c.id) : undefined;
      const mapping = c.mapping as Record<string, unknown> | undefined;
      const lines: string[] = [];
      if (mapping && typeof mapping === "object") {
        for (const node of Object.values(mapping)) {
          const n = node as { message?: { content?: { parts?: unknown[] }; author?: { role?: string } } };
          const parts = n.message?.content?.parts;
          const role = n.message?.author?.role ?? "unknown";
          if (Array.isArray(parts)) {
            const text = parts.filter((p) => typeof p === "string").join("\n");
            if (text.trim()) lines.push(`## ${role}\n\n${text}`);
          }
        }
      }
      items.push({
        title,
        body: lines.join("\n\n") || "_Empty conversation_",
        source_id: id,
        occurred_at:
          typeof c.create_time === "number"
            ? new Date(c.create_time * 1000).toISOString()
            : undefined,
      });
    }
    return {
      adapter: chatgptAdapter.sourceKey,
      parser_version: chatgptAdapter.parser_version,
      count: items.length,
      sampleTitles: items.slice(0, 5).map((i) => i.title),
      items,
    };
  },
};
