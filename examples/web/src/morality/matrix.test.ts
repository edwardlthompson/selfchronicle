import { beforeEach, describe, expect, it } from "vitest";
import {
  MORALITY_DISCLAIMER,
  defaultMatrix,
  getMatrix,
  hasSingleScore,
  saveMatrix,
  updateAxis,
} from "./matrix";

describe("morality matrix", () => {
  beforeEach(() => localStorage.clear());

  it("defaults provisional axes without a single score", () => {
    const m = defaultMatrix();
    expect(m.provisional).toBe(true);
    expect(m.axes.length).toBeGreaterThanOrEqual(5);
    expect(hasSingleScore(m)).toBe(false);
    expect(m.disclaimer).toBe(MORALITY_DISCLAIMER);
    expect(m.disclaimer.toLowerCase()).toContain("not a morality score");
  });

  it("marks user edits and stays provisional", () => {
    let m = getMatrix();
    m = updateAxis(m, "care", { placement: 80, why: "Family first" });
    saveMatrix(m);
    const loaded = getMatrix();
    const care = loaded.axes.find((a) => a.id === "care");
    expect(care?.placement).toBe(80);
    expect(care?.user_edited).toBe(true);
    expect(care?.status).toBe("provisional");
    expect(loaded.provisional).toBe(true);
  });
});
