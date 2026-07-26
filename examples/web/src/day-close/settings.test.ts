import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_DAY_CLOSE,
  inEveningWindow,
  loadDayCloseSettings,
  saveDayCloseSettings,
  shouldOfferDayClose,
} from "./settings";

describe("day-close settings", () => {
  beforeEach(() => localStorage.clear());

  it("defaults opt-in off", () => {
    expect(loadDayCloseSettings().enabled).toBe(false);
    expect(loadDayCloseSettings().maxQuestions).toBe(3);
  });

  it("persists settings with hard maxQuestions 3", () => {
    saveDayCloseSettings({
      ...DEFAULT_DAY_CLOSE,
      enabled: true,
      maxQuestions: 3,
    });
    expect(loadDayCloseSettings().enabled).toBe(true);
  });

  it("detects evening window including overnight", () => {
    const s = {
      ...DEFAULT_DAY_CLOSE,
      windowStart: "22:00",
      windowEnd: "01:00",
    };
    expect(inEveningWindow(s, new Date("2026-07-26T23:00:00"))).toBe(true);
    expect(inEveningWindow(s, new Date("2026-07-26T12:00:00"))).toBe(false);
  });

  it("suppresses when focus mode or snoozed", () => {
    const s = { ...DEFAULT_DAY_CLOSE, enabled: true, focusMode: true };
    expect(shouldOfferDayClose(s, null, new Date("2026-07-26T22:00:00"))).toBe(
      false,
    );
    const awake = { ...DEFAULT_DAY_CLOSE, enabled: true, focusMode: false };
    const at = new Date("2026-07-26T22:00:00");
    const future = at.getTime() + 60_000;
    expect(shouldOfferDayClose(awake, future, at)).toBe(false);
  });
});
