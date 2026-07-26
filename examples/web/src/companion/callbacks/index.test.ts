import { describe, expect, it } from "vitest";
import { callbackCard, repairRitualCopy } from "./index";
describe("callbacks", () => {
  it("provenance + repair", () => {
    expect(callbackCard("ev1")).toMatch(/source/i);
    expect(repairRitualCopy()).toMatch(/edit wins/i);
  });
});
