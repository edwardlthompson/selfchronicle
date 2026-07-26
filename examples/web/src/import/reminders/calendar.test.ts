import { beforeEach, describe, expect, it } from "vitest";
import {
  dueReminders,
  loadReminders,
  setReminderEnabled,
} from "./calendar";

describe("import reminders", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to opt-in off", () => {
    expect(loadReminders().every((r) => r.enabled === false)).toBe(true);
    expect(dueReminders()).toEqual([]);
  });

  it("surfaces due reminders only when enabled", () => {
    setReminderEnabled("chatgpt", true);
    const due = dueReminders(new Date("2026-07-01T00:00:00Z"));
    expect(due.map((r) => r.source)).toContain("chatgpt");
  });
});
