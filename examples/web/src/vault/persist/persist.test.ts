import { beforeEach, describe, expect, it } from "vitest";
import { MemoryVaultStore } from "./store";
import { ProfileVault } from "../profileVault";
import { LOCAL_PROFILE_ID, setActiveProfileId } from "./profileKey";

describe("ProfileVault persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    setActiveProfileId(LOCAL_PROFILE_ID);
  });

  it("round-trips evidence through MemoryVaultStore", async () => {
    const store = new MemoryVaultStore();
    const vault = new ProfileVault({ store, profileId: "test:1" });
    await vault.open("idb://test:1");
    await vault.appendEvidence({ title: "Persist me", body: "survives restart", tags: ["t"] });

    const vault2 = new ProfileVault({ store, profileId: "test:1" });
    await vault2.open("idb://test:1");
    const listed = await vault2.listEvidence();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.frontmatter.title).toBe("Persist me");
  });

  it("persists facts layers", async () => {
    const store = new MemoryVaultStore();
    const vault = new ProfileVault({ store, profileId: "test:2" });
    await vault.open();
    await vault.upsertLayer("facts", "Grok archive", "623 conversations imported.");

    const vault2 = new ProfileVault({ store, profileId: "test:2" });
    await vault2.open();
    const facts = await vault2.listLayer("facts");
    expect(facts.some((f) => f.frontmatter.title === "Grok archive")).toBe(true);
  });

  it("exports snapshot with files and layers", async () => {
    const vault = new ProfileVault({ persist: false });
    await vault.open();
    await vault.appendEvidence({ title: "A", body: "B" });
    const snap = vault.exportSnapshot();
    expect(Object.keys(snap.files).length).toBeGreaterThan(0);
    expect(snap.schema_version).toBe(1);
  });
});
