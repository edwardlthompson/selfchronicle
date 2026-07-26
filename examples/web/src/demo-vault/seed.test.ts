import { describe, expect, it } from "vitest";
import { isSyntheticId, seedDemoVault } from "./seed";

describe("demo vault seed", () => {
  it("returns synthetic items with demo_ ids", () => {
    const items = seedDemoVault();
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items.every((i) => isSyntheticId(i.id))).toBe(true);
    expect(items.some((i) => i.type === "fact")).toBe(true);
  });
});
