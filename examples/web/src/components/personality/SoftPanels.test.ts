import { describe, expect, it } from "vitest";
import { defaultPersonality, defaultWellbeing } from "../../soft/flags";
import { renderSoftPanels } from "./SoftPanels";

describe("renderSoftPanels", () => {
  it("shows provisional disclaimers and wellbeing off by default", () => {
    const html = renderSoftPanels(defaultPersonality(), defaultWellbeing());
    expect(html).toContain("data-testid=\"personality-disclaimer\"");
    expect(html).toContain("not a diagnosis");
    expect(html).toContain("never clinical");
    expect(html).toContain("data-soft-wb-enabled");
    expect(html).not.toMatch(/data-soft-wb-enabled[^>]*checked/);
  });
});
