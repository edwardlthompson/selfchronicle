import { describe, expect, it } from "vitest";
import { createSessionStore } from "./session.js";
import { invokeTool } from "./tools.js";
import { createMemoryVault } from "./vaultMemory.js";

describe("mcp tools", () => {
  it("denies without session", () => {
    const sessions = createSessionStore();
    const vault = createMemoryVault();
    const r = invokeTool("vault_search", { q: "x" }, undefined, sessions, vault);
    expect(r.ok).toBe(false);
  });

  it("searches and appends with scopes", () => {
    const sessions = createSessionStore();
    const vault = createMemoryVault();
    const s = sessions.grant("cursor", ["read", "write-evidence"]);
    vault.appendEvidence("Maple day", "We talked about maple.");
    const hits = invokeTool("vault_search", { q: "maple" }, s.token, sessions, vault);
    expect(hits.ok).toBe(true);
    if (hits.ok) expect((hits.data as unknown[]).length).toBeGreaterThan(0);
    const written = invokeTool(
      "append_evidence",
      { title: "Note", body: "Hello" },
      s.token,
      sessions,
      vault,
    );
    expect(written.ok).toBe(true);
  });

  it("requires confirm for propose_fact", () => {
    const sessions = createSessionStore();
    const vault = createMemoryVault();
    const s = sessions.grant("cursor", ["write-evidence"]);
    const pending = invokeTool("propose_fact", { title: "T" }, s.token, sessions, vault);
    expect(pending.ok).toBe(false);
    if (!pending.ok) expect(pending.needs_confirm).toBe(true);
    const ok = invokeTool(
      "propose_fact",
      { title: "T", confirm: true },
      s.token,
      sessions,
      vault,
    );
    expect(ok.ok).toBe(true);
  });
});
