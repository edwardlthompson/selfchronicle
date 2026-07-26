import { describe, expect, it } from "vitest";
import { getPrompt, isLocalOnly, listPrompts } from "./library";

describe("coach prompt library", () => {
  it("lists local FOSS prompts", () => {
    const all = listPrompts();
    expect(all.length).toBeGreaterThanOrEqual(3);
    expect(isLocalOnly()).toBe(true);
  });

  it("filters by tag and fetches by id", () => {
    expect(listPrompts("day-close").every((p) => p.tags.includes("day-close"))).toBe(
      true,
    );
    expect(getPrompt("clarify-decision")?.title).toContain("decision");
    expect(getPrompt("missing")).toBeUndefined();
  });
});
