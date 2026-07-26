import { beforeEach, describe, expect, it } from "vitest";
import {
  COGNITION_DISCLAIMER,
  bandLabels,
  defaultProfile,
  getProfile,
  iqScore,
  saveProfile,
  updateProfile,
} from "./profile";

describe("cognition profile", () => {
  beforeEach(() => localStorage.clear());

  it("stores bands/preferences and never yields an IQ number", () => {
    const p = defaultProfile();
    expect(p.provisional).toBe(true);
    expect(iqScore(p)).toBeNull();
    expect(p.disclaimer).toBe(COGNITION_DISCLAIMER);
    expect(p.disclaimer.toLowerCase()).toContain("not an iq");
    const labels = bandLabels(p);
    expect(labels.some((l) => /thread|long-form|load/i.test(l))).toBe(true);
    expect(labels.every((l) => !/\d{2,3}\s*iq/i.test(l))).toBe(true);
  });

  it("persists user edits as provisional", () => {
    let p = getProfile();
    p = updateProfile(p, { currentLoad: "high", threadPref: "one_thread" });
    saveProfile(p);
    const loaded = getProfile();
    expect(loaded.currentLoad).toBe("high");
    expect(loaded.user_edited).toBe(true);
    expect(loaded.provisional).toBe(true);
  });
});
