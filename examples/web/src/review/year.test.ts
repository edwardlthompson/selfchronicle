import { describe, expect, it } from "vitest";
import { compileYearReview } from "./year";

describe("year in review", () => {
  it("compiles only items for the requested year", () => {
    const r = compileYearReview(
      2025,
      [
        { id: "1", title: "Shipped MVP", occurredAt: "2025-03-01T00:00:00Z" },
        { id: "2", title: "Old note", occurredAt: "2024-12-01T00:00:00Z" },
      ],
      new Date("2026-01-01T00:00:00Z"),
    );
    expect(r.itemCount).toBe(1);
    expect(r.titles).toEqual(["Shipped MVP"]);
    expect(r.markdown).toContain("Year in review — 2025");
    expect(r.markdown).toContain("user-triggered");
  });

  it("handles empty year", () => {
    const r = compileYearReview(2030, []);
    expect(r.itemCount).toBe(0);
    expect(r.markdown).toContain("no items");
  });
});
