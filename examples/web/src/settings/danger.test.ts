import { describe, expect, it } from "vitest";
import { confirmWipe } from "./danger";

describe("confirmWipe", () => {
  it("requires exact DELETE token", () => {
    expect(confirmWipe("DELETE")).toBe(true);
    expect(confirmWipe("delete")).toBe(false);
  });
});
