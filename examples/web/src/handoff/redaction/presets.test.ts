import { describe, expect, it } from "vitest";
import { policyFor } from "./presets";

describe("handoff redaction", () => {
  it("keeps wellbeing off in all presets", () => {
    for (const p of ["coding", "personal", "redacted"] as const) {
      expect(policyFor(p).includeWellbeing).toBe(false);
    }
  });
});
