import { describe, expect, it } from "vitest";
import { includesLayer, packForRole } from "./packs";

describe("role context packs", () => {
  it("coding includes curiosity, excludes people/values/wellbeing", () => {
    const p = packForRole("coding");
    expect(p.layers).toEqual(["biography", "facts", "curiosity"]);
    expect(includesLayer("coding", "people")).toBe(false);
    expect(includesLayer("coding", "wellbeing")).toBe(false);
  });

  it("personal includes values and people", () => {
    const p = packForRole("personal");
    expect(p.layers).toContain("values");
    expect(p.layers).toContain("people");
    expect(p.layers).not.toContain("wellbeing");
  });

  it("redacted is minimal biography+facts", () => {
    expect(packForRole("redacted").layers).toEqual(["biography", "facts"]);
  });
});
