import { beforeEach, describe, expect, it } from "vitest";
import {
  loadA11yPrefs,
  setKeyboardDayClose,
  setReducedMotion,
} from "./prefs";

describe("a11y prefs", () => {
  beforeEach(() => localStorage.clear());

  it("defaults keyboard Day Close on, reduced motion off", () => {
    const p = loadA11yPrefs();
    expect(p.keyboardDayClose).toBe(true);
    expect(p.reducedMotion).toBe(false);
  });

  it("persists flags", () => {
    setReducedMotion(true);
    setKeyboardDayClose(false);
    expect(loadA11yPrefs()).toEqual({
      reducedMotion: true,
      keyboardDayClose: false,
    });
  });
});
