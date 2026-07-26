import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ProfileVault } from "../../../vault";
import { distillAndPersistBio } from "../../../profile/bioVault";
import { commitImportReview } from "../../commit";
import { memoryDisclosureAdapter } from "./index";
import { parseMemoryDisclosureMarkdown } from "./parse";

const GROK_LIVE =
  process.env.GROK_MEMORY_DISCLOSURE_MD ??
  "c:/Users/edwar/Documents/Memory_Disclosure_Report_Edward_Thompson.md";
const GEMINI_LIVE =
  process.env.GEMINI_MEMORY_DISCLOSURE_MD ?? "c:/Users/edwar/Documents/memory_disclosure_report.md";

function reportInferred(label: string, path: string): void {
  const parsed = parseMemoryDisclosureMarkdown(readFileSync(path, "utf8"));
  console.log(`\n--- ${label} (${parsed.vendor}) ---`);
  console.log(JSON.stringify(parsed.identity, null, 2));
  console.log("facts:", parsed.facts.map((f) => f.title).join(", "));
}

describe("memory disclosure live (optional)", () => {
  it("parses Grok disclosure when present", async () => {
    if (!existsSync(GROK_LIVE)) {
      console.warn("skip Grok memory disclosure — missing:", GROK_LIVE);
      return;
    }
    reportInferred("Grok", GROK_LIVE);
    const raw = readFileSync(GROK_LIVE, "utf8");
    const review = await memoryDisclosureAdapter.parse(raw);
    expect(review.vendor).toBe("grok");
    expect((review.layerFacts ?? []).length).toBeGreaterThan(0);

    const vault = new ProfileVault({ persist: false });
    await vault.open("memory://grok-disclosure-live");
    await commitImportReview(vault, review);
    const bio = await distillAndPersistBio(vault);
    expect(bio.displayName).toMatch(/Edward/i);
    expect(bio.homeAddress).toMatch(/Puerto Rico|San Juan/i);
    expect(bio.age).toBe(43);
  }, 60_000);

  it("parses Gemini disclosure when present", async () => {
    if (!existsSync(GEMINI_LIVE)) {
      console.warn("skip Gemini memory disclosure — missing:", GEMINI_LIVE);
      return;
    }
    reportInferred("Gemini", GEMINI_LIVE);
    const raw = readFileSync(GEMINI_LIVE, "utf8");
    const review = await memoryDisclosureAdapter.parse(raw);
    expect(review.vendor).toBe("gemini");

    const vault = new ProfileVault({ persist: false });
    await vault.open("memory://gemini-disclosure-live");
    await commitImportReview(vault, review);
    const bio = await distillAndPersistBio(vault);
    expect(bio.displayName).toMatch(/Edward/i);
    expect(bio.homeAddress).toMatch(/Puerto Rico/i);
    expect(bio.occupations?.some((o) => /tour guide|developer/i.test(o))).toBe(true);
  }, 60_000);

  it("merges both disclosures with existing grok pack evidence", async () => {
    if (!existsSync(GROK_LIVE) || !existsSync(GEMINI_LIVE)) return;
    const vault = new ProfileVault({ persist: false });
    await vault.open("memory://combined-disclosure-live");
    await vault.appendEvidence({ title: "grok pack", body: "archive", tags: ["import", "grok"] });
    await commitImportReview(vault, await memoryDisclosureAdapter.parse(readFileSync(GROK_LIVE, "utf8")));
    await commitImportReview(vault, await memoryDisclosureAdapter.parse(readFileSync(GEMINI_LIVE, "utf8")));
    const bio = await distillAndPersistBio(vault);
    console.log("\n--- Combined About you ---");
    console.log(JSON.stringify(bioToReport(bio), null, 2));
    expect((await vault.listEvidence()).some((d) => d.frontmatter.tags.includes("grok_memory"))).toBe(true);
    expect((await vault.listEvidence()).some((d) => d.frontmatter.tags.includes("gemini_memory"))).toBe(true);
    expect((await vault.listEvidence()).some((d) => d.frontmatter.title === "grok pack")).toBe(true);
    expect(bio.displayName).toMatch(/Edward/i);
    expect(bio.age).toBe(43);
  }, 60_000);
});

function bioToReport(bio: Awaited<ReturnType<typeof distillAndPersistBio>>) {
  return {
    displayName: bio.displayName,
    age: bio.age,
    dateOfBirth: bio.dateOfBirth,
    homeAddress: bio.homeAddress,
    occupations: bio.occupations,
    links: bio.links,
    sources: bio.sources,
  };
}
