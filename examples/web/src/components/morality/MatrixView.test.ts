import { describe, expect, it } from "vitest";
import { defaultMatrix, updateAxis } from "../../morality/matrix";
import { renderMatrixView } from "./MatrixView";

describe("renderMatrixView", () => {
  it("renders disclaimer and provisional axes without a score total", () => {
    const m = updateAxis(defaultMatrix(), "fairness", { placement: 70 });
    const html = renderMatrixView(m);
    expect(html).toContain('data-testid="morality-disclaimer"');
    expect(html).toContain("Not a morality score");
    expect(html).toContain('data-testid="morality-matrix"');
    expect(html).toContain("data-axis=\"fairness\"");
    expect(html).toContain("provisional");
    expect(html.toLowerCase()).not.toContain("morality score:");
    expect(html).not.toContain("iq");
  });
});
