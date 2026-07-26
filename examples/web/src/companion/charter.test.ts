import { describe, expect, it } from "vitest";
import {
  AI_DISCLOSURE,
  assertsAiDisclosure,
  containsLonelinessGuilt,
  defaultCharter,
  respectsForget,
  sanitizeCompanionCopy,
} from "./charter";

describe("companion charter", () => {
  it("discloses AI and forbids loneliness guilt", () => {
    const c = defaultCharter();
    expect(assertsAiDisclosure(c.aiDisclosure)).toBe(true);
    expect(c.forbidsLonelinessGuilt).toBe(true);
    expect(c.forgetRespect).toBe(true);
    expect(respectsForget(c)).toBe(true);
    expect(containsLonelinessGuilt("I'll be lonely without you")).toBe(true);
    expect(sanitizeCompanionCopy("I'll be lonely")).toBe(AI_DISCLOSURE);
    expect(containsLonelinessGuilt(AI_DISCLOSURE)).toBe(false);
  });
});
