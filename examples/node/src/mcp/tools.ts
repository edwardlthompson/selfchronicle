import type { SessionStore } from "./session.js";
import type { MemoryVault } from "./vaultMemory.js";

export const TOOL_NAMES = [
  "vault_list",
  "vault_read",
  "vault_search",
  "get_profile_summary",
  "get_on_this_day",
  "get_curiosity_open",
  "append_evidence",
  "propose_fact",
  "export_handoff",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

export type ToolResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string; needs_confirm?: boolean };

export function invokeTool(
  name: string,
  args: Record<string, unknown>,
  token: string | undefined,
  sessions: SessionStore,
  vault: MemoryVault,
): ToolResult {
  const session = token ? sessions.get(token) : null;
  if (!session) {
    sessions.record("deny", `${name} no session`);
    return { ok: false, error: "unauthorized" };
  }

  const needWrite = name === "append_evidence" || name === "propose_fact";
  const scope = needWrite ? "write-evidence" : "read";
  if (!sessions.hasScope(session, scope as "read" | "write-evidence")) {
    sessions.record("deny", `${name} missing ${scope}`);
    return { ok: false, error: `missing scope: ${scope}` };
  }

  sessions.record("call", `${session.client} ${name}`);

  switch (name as ToolName) {
    case "vault_list":
      return { ok: true, data: vault.list(typeof args.layer === "string" ? args.layer : undefined) };
    case "vault_read": {
      const id = String(args.id ?? "");
      const note = vault.read(id);
      return note ? { ok: true, data: note } : { ok: false, error: "not_found" };
    }
    case "vault_search":
      return { ok: true, data: vault.search(String(args.q ?? "")) };
    case "get_profile_summary":
      return {
        ok: true,
        data: {
          ...vault.summary(),
          note: "Provisional layers excluded unless granted.",
        },
      };
    case "get_on_this_day":
      return {
        ok: true,
        data: vault.onThisDay(String(args.date ?? new Date().toISOString())),
      };
    case "get_curiosity_open":
      return { ok: true, data: [] };
    case "append_evidence": {
      const title = String(args.title ?? "").trim();
      const body = String(args.body ?? "").trim();
      if (!title || !body) return { ok: false, error: "title and body required" };
      return { ok: true, data: vault.appendEvidence(title, body) };
    }
    case "propose_fact": {
      if (args.confirm !== true) {
        sessions.record("confirm", "propose_fact needs confirm");
        return { ok: false, error: "confirmation required", needs_confirm: true };
      }
      sessions.record("confirm", "propose_fact allowed");
      return {
        ok: true,
        data: {
          proposed: String(args.title ?? "Untitled fact"),
          status: "pending_user_accept",
        },
      };
    }
    case "export_handoff":
      return {
        ok: true,
        data: {
          files: ["HANDOFF.md", "facts.md"],
          wellbeing_included: false,
        },
      };
    default:
      return { ok: false, error: `unknown tool: ${name}` };
  }
}
