import { describe, expect, it } from "vitest";
import { deepLayersOptIn, handoffIncludesSummaryByDefault } from "./policy";
describe("handoff summary", () => {
  it("summary on, deep off", () => {
    expect(handoffIncludesSummaryByDefault()).toBe(true);
    expect(deepLayersOptIn()).toBe(false);
  });
});
