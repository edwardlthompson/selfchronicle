import { describe, expect, it } from "vitest";
import { defaultProfile, updateProfile } from "../../cognition/profile";
import { renderCognitionView } from "./CognitionView";

describe("renderCognitionView", () => {
  it("renders band labels and disclaimer without IQ", () => {
    const p = updateProfile(defaultProfile(), {
      currentLoad: "high",
      complexityPref: "long_form_ok",
    });
    const html = renderCognitionView(p);
    expect(html).toContain('data-testid="cognition-disclaimer"');
    expect(html).toContain("Not an IQ score");
    expect(html).toContain('data-testid="cognition-bands"');
    expect(html).toContain("High load today");
    expect(html).toContain("Long-form OK");
    expect(html.toLowerCase()).not.toContain("iq:");
    expect(html.toLowerCase()).toContain("not an iq score");
    expect(html.toLowerCase()).toMatch(/not an iq score,\s*adhd claim/);
  });
});

