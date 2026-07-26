import { describe, expect, it } from "vitest";
import { captureRecapFallback } from "./recap";

describe("voice recap", () => {
  it("falls back to keyboard text", async () => {
    const r = await captureRecapFallback("  calm day  ");
    expect(r).toEqual({ text: "calm day", source: "keyboard" });
  });
});
