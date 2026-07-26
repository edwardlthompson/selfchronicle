import { beforeEach, describe, expect, it } from "vitest";
import { loadCuriosity, nextOpen, saveCuriosity } from "./curiosity";

describe("curiosity", () => {
  beforeEach(() => localStorage.clear());

  it("seeds open questions and returns next", () => {
    const items = loadCuriosity();
    expect(items.length).toBeGreaterThan(0);
    expect(nextOpen(items)?.status).toBe("open");
    items[0]!.status = "answered";
    saveCuriosity(items);
    expect(loadCuriosity()[0]!.status).toBe("answered");
  });
});
