import { describe, expect, it } from "vitest";
import { DEFAULT_DAY_CLOSE } from "../day-close/settings";
import { inQuietHours, loadFocusQuiet, saveFocusQuiet } from "./settings";
import { shouldOfferCue } from "./suppress";

describe("focus-quiet", () => {
  it("detects overnight quiet hours", () => {
    const s = { focusMode: false, quietStart: "23:00", quietEnd: "07:00" };
    expect(inQuietHours(s, new Date(2026, 6, 26, 23, 30))).toBe(true);
    expect(inQuietHours(s, new Date(2026, 6, 26, 6, 0))).toBe(true);
    expect(inQuietHours(s, new Date(2026, 6, 26, 12, 0))).toBe(false);
  });

  it("suppresses Day Close when Focus Mode is on", () => {
    const dc = { ...DEFAULT_DAY_CLOSE, enabled: true, windowStart: "00:00", windowEnd: "23:59" };
    const fq = { focusMode: true, quietStart: "23:30", quietEnd: "07:00" };
    expect(shouldOfferCue(dc, fq, null, new Date(2026, 6, 26, 21, 0))).toBe(false);
  });

  it("persists focus settings", () => {
    saveFocusQuiet({ focusMode: true, quietStart: "22:00", quietEnd: "06:00" });
    expect(loadFocusQuiet().focusMode).toBe(true);
  });
});
