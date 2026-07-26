import { describe, expect, it } from "vitest";
import { parseFrontmatter, serializeDocument, coerceFrontmatter } from "./frontmatter";
import { isVaultId, newVaultId } from "./ids";
import { MemoryVault } from "./memoryVault";

describe("ids", () => {
  it("creates sc_ typed ids", () => {
    const id = newVaultId("evidence");
    expect(id.startsWith("sc_ev_")).toBe(true);
    expect(isVaultId(id)).toBe(true);
  });
});

describe("frontmatter", () => {
  it("round-trips evidence document", () => {
    const fm = coerceFrontmatter({
      id: "sc_ev_test",
      type: "evidence",
      title: "Hello",
      created_at: "2026-07-26T00:00:00Z",
      updated_at: "2026-07-26T00:00:00Z",
      ingested_at: "2026-07-26T00:00:00Z",
      tags: ["a", "b"],
      status: "active",
      user_edited: true,
      provenance: { source: "manual" },
      links: { evidence: [], facts: [], attachments: [] },
    });
    const md = serializeDocument(fm, "Body text");
    const { data, body } = parseFrontmatter(md);
    expect(body.trim()).toBe("Body text");
    expect(coerceFrontmatter(data).title).toBe("Hello");
    expect(coerceFrontmatter(data).provenance.source).toBe("manual");
  });
});

describe("MemoryVault", () => {
  it("opens, appends evidence, lists, searches, rebuilds index", async () => {
    const vault = new MemoryVault();
    const status = await vault.open("memory://test");
    expect(status.open).toBe(true);
    expect(status.meta?.schema_version).toBe(1);

    const doc = await vault.appendEvidence({
      title: "First note",
      body: "Remember the maple tree",
      tags: ["journal"],
    });
    expect(doc.path).toContain("evidence/");
    expect(doc.frontmatter.id.startsWith("sc_ev_")).toBe(true);

    const listed = await vault.listEvidence();
    expect(listed).toHaveLength(1);

    const hits = await vault.search("maple");
    expect(hits).toHaveLength(1);
    expect(hits[0]?.title).toBe("First note");

    const rebuilt = await vault.rebuildIndex();
    expect(rebuilt.indexed).toBeGreaterThanOrEqual(1);

    const again = await vault.status();
    expect(again.evidenceCount).toBe(1);
    expect(again.rootLabel).toBe("memory://test");
  });
});
