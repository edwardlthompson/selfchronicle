import type { ImportAdapter, ParsedItem } from "../../types";
import { thinReview } from "../shared";

const KNOWN = [
  "conversations",
  "projects",
  "tasks",
  "media_posts",
  "conversation",
  "responses",
  "response",
  "title",
  "message",
  "sender",
] as const;

const BODY_MAX = 12_000;

function asIso(raw: unknown): string | undefined {
  if (typeof raw === "string" && raw) return raw;
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const date = o.$date;
    if (typeof date === "string") return date;
    if (date && typeof date === "object") {
      const n = (date as Record<string, unknown>).$numberLong;
      const ms = typeof n === "string" || typeof n === "number" ? Number(n) : NaN;
      if (Number.isFinite(ms)) return new Date(ms).toISOString();
    }
  }
  return undefined;
}

function responseText(wrap: unknown): string {
  if (!wrap || typeof wrap !== "object") return "";
  const outer = wrap as Record<string, unknown>;
  const r = (outer.response && typeof outer.response === "object"
    ? outer.response
    : outer) as Record<string, unknown>;
  const sender = String(r.sender ?? r.role ?? "");
  const msg = String(r.message ?? r.content ?? r.text ?? "");
  if (!msg) return "";
  return sender ? `${sender}: ${msg}` : msg;
}

function conversationItem(row: unknown, index: number): ParsedItem {
  const root = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
  const conv = (root.conversation && typeof root.conversation === "object"
    ? root.conversation
    : root) as Record<string, unknown>;
  const responses = Array.isArray(root.responses) ? root.responses : [];
  const title = String(conv.title ?? conv.name ?? `Grok chat ${index + 1}`);
  const parts = responses.map(responseText).filter(Boolean);
  let body = parts.join("\n\n");
  if (!body) body = String(conv.summary ?? JSON.stringify(conv).slice(0, 2000));
  if (body.length > BODY_MAX) body = `${body.slice(0, BODY_MAX)}\n\n…[truncated]`;
  return {
    title,
    body,
    source_id: conv.id != null ? String(conv.id) : undefined,
    occurred_at: asIso(conv.create_time) ?? asIso(conv.created_at),
  };
}

/** Official xAI zip → prod-grok-backend.json shape, plus legacy flat arrays. */
export function parseGrokExportData(data: unknown): ParsedItem[] {
  if (Array.isArray(data)) {
    return data.map((row, i) => conversationItem(row, i));
  }
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.conversations)) {
      return o.conversations.map((row, i) => conversationItem(row, i));
    }
    for (const k of ["chats", "messages", "items", "threads"]) {
      if (Array.isArray(o[k])) {
        return (o[k] as unknown[]).map((row, i) => conversationItem(row, i));
      }
    }
  }
  return [];
}

export const grokAdapter: ImportAdapter = {
  sourceKey: "grok_export",
  parser_version: "grok_json_v2",
  guideSteps: [
    "Download from accounts.x.ai/data and unzip",
    "Pick prod-grok-backend.json (or paste a small JSON sample)",
    "Vault → Import → ✦ Grok → Parse → Commit",
  ],
  async parse(raw: string) {
    const data = JSON.parse(raw) as unknown;
    const root =
      data && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : undefined;
    const items = parseGrokExportData(data);
    return thinReview({
      sourceKey: grokAdapter.sourceKey,
      parser_version: grokAdapter.parser_version,
      knownKeys: KNOWN,
      items,
      root,
    });
  },
};
