import { describe, expect, it } from "vitest";
import {
  HEAVY_DAY_COPY,
  findClinicalLanguage,
  heavyDayStrings,
} from "./copy";

describe("heavy-day copy", () => {
  it("is supportive and non-clinical", () => {
    for (const s of heavyDayStrings()) {
      expect(findClinicalLanguage(s)).toEqual([]);
    }
    expect(HEAVY_DAY_COPY.body.toLowerCase()).toContain("kind");
    expect(HEAVY_DAY_COPY.resourcesHref).toMatch(/^https:\/\//);
  });

  it("detects banned diagnosis words in arbitrary text", () => {
    expect(findClinicalLanguage("This is a diagnosis of X")).toContain("diagnos");
  });
});
