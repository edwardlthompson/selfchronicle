import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileVault } from "../vault";
import { maybeDebugDisclosureImport, maybeDebugSeedImport } from "./seedImport";

const FIX = join(import.meta.dirname, "../../../../fixtures/memory-disclosure");
const GROK_MD = readFileSync(join(FIX, "grok-synthetic.md"), "utf8");
const GEMINI_MD = readFileSync(join(FIX, "gemini-synthetic.md"), "utf8");

describe("debug seed import", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    window.history.replaceState({}, "", "/");
  });

  it("skips JSON pack when vault has evidence", async () => {
    vi.stubEnv("VITE_DEBUG_SEED_IMPORT", "false");
    const vault = new ProfileVault({ persist: false });
    await vault.open("memory://seed-test");
    await vault.appendEvidence({ title: "existing", body: "keep", tags: ["import"] });
    const fetchMock = vi.mocked(fetch);
    const imported = await maybeDebugSeedImport(vault);
    expect(imported).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("imports disclosure markdown without clearing existing evidence", async () => {
    window.history.replaceState({}, "", "/?debugSeed=disclosure");
    const vault = new ProfileVault({ persist: false });
    await vault.open("memory://disclosure-test");
    await vault.appendEvidence({ title: "grok pack", body: "archive", tags: ["import", "grok"] });

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(GROK_MD))
      .mockResolvedValueOnce(new Response(GEMINI_MD));

    const imported = await maybeDebugDisclosureImport(vault);
    expect(imported).toBe(true);
    const evidence = await vault.listEvidence();
    expect(evidence.some((d) => d.frontmatter.tags.includes("grok_memory"))).toBe(true);
    expect(evidence.some((d) => d.frontmatter.tags.includes("gemini_memory"))).toBe(true);
    expect(evidence.some((d) => d.frontmatter.title === "grok pack")).toBe(true);
  });

  it("skips disclosure vendors already tagged", async () => {
    window.history.replaceState({}, "", "/?debugSeed=disclosure");
    const vault = new ProfileVault({ persist: false });
    await vault.open("memory://disclosure-skip");
    await vault.appendEvidence({
      title: "Grok / xAI memory disclosure report",
      body: GROK_MD,
      tags: ["import", "memory_disclosure", "grok_memory"],
    });

    vi.mocked(fetch).mockResolvedValueOnce(new Response(GEMINI_MD));
    const imported = await maybeDebugDisclosureImport(vault);
    expect(imported).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
