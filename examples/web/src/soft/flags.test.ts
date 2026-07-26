import { beforeEach, describe, expect, it } from "vitest";
import {
  WELLBEING_DISCLAIMER,
  defaultWellbeing,
  loadSoft,
  saveSoft,
} from "./flags";

describe("soft flags", () => {
  beforeEach(() => localStorage.clear());

  it("wellbeing is off by default and carries disclaimer", () => {
    const wb = loadSoft("wellbeing");
    expect(wb.enabled).toBe(false);
    expect(wb.provisional).toBe(true);
    expect(wb.disclaimer).toBe(WELLBEING_DISCLAIMER);
    expect(wb.disclaimer.toLowerCase()).toContain("clinical");
  });

  it("persists personality edits as provisional", () => {
    const p = loadSoft("personality");
    p.body = "Updated";
    p.user_edited = true;
    saveSoft(p);
    expect(loadSoft("personality").body).toBe("Updated");
    expect(loadSoft("personality").provisional).toBe(true);
  });

  it("default wellbeing disabled", () => {
    expect(defaultWellbeing().enabled).toBe(false);
  });
});
