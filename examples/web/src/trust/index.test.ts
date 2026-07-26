import { describe, expect, it } from "vitest";
import { forget, isForgotten } from "./index";
describe("trust", () => {
  it("respects forget", () => {
    forget("x1");
    expect(isForgotten("x1")).toBe(true);
  });
});
