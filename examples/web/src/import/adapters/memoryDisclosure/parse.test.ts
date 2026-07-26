import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseMemoryDisclosureMarkdown } from "./parse";

const FIX = join(import.meta.dirname, "../../../../../../fixtures/memory-disclosure");

describe("memory disclosure parse", () => {
  it("detects Grok and extracts identity from synthetic fixture", () => {
    const raw = readFileSync(join(FIX, "grok-synthetic.md"), "utf8");
    const parsed = parseMemoryDisclosureMarkdown(raw);
    expect(parsed.vendor).toBe("grok");
    expect(parsed.identity.displayName).toBe("Alex Rivera");
    expect(parsed.identity.age).toBe(36);
    expect(parsed.identity.homeAddress).toMatch(/Portland/i);
    expect(parsed.identity.links?.some((u) => u.includes("github.com/alexdev"))).toBe(true);
    expect(parsed.identity.occupations).toEqual(expect.arrayContaining(["Android developer", "Technical writer"]));
    expect(parsed.facts.some((f) => f.title.includes("Full name"))).toBe(true);
  });

  it("detects Gemini and extracts identity from synthetic fixture", () => {
    const raw = readFileSync(join(FIX, "gemini-synthetic.md"), "utf8");
    const parsed = parseMemoryDisclosureMarkdown(raw);
    expect(parsed.vendor).toBe("gemini");
    expect(parsed.identity.displayName).toBe("Alex Rivera");
    expect(parsed.identity.homeAddress).toMatch(/Puerto Rico|Portland/i);
    expect(parsed.identity.occupations?.length).toBeGreaterThan(0);
  });

  it("adapter commits layer facts shape", async () => {
    const { memoryDisclosureAdapter } = await import("./index");
    const raw = readFileSync(join(FIX, "grok-synthetic.md"), "utf8");
    const review = await memoryDisclosureAdapter.parse(raw);
    expect(review.count).toBe(1);
    expect(review.parser_version).toBe("memory_disclosure_md_v1");
    expect((review as { layerFacts?: unknown[] }).layerFacts?.length).toBeGreaterThan(0);
  });

  it("extracts many career chips from multi-career synthetic Grok block", () => {
    const raw = readFileSync(join(FIX, "multi-career-synthetic.md"), "utf8");
    const parsed = parseMemoryDisclosureMarkdown(raw);
    expect(parsed.vendor).toBe("grok");
    expect(parsed.identity.occupations).toEqual(
      expect.arrayContaining([
        "Android developer",
        "FOSS contributor",
        "Tour guide",
        "Business owner",
        "Technical writer",
        "Photographer",
        "Amateur radio operator",
        "Crypto developer",
        "AI developer",
      ]),
    );
    expect(parsed.identity.occupations!.length).toBeGreaterThanOrEqual(9);
  });
});
