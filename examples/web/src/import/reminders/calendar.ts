/** Opt-in import calendar reminders (local preferences only). */

export type ImportReminder = {
  source: string;
  cadenceDays: number;
  enabled: boolean;
  lastRemindedAt: string | null;
};

const KEY = "sc.import.reminders";

export function defaultReminders(): ImportReminder[] {
  return [
    { source: "chatgpt", cadenceDays: 30, enabled: false, lastRemindedAt: null },
    { source: "gmail", cadenceDays: 14, enabled: false, lastRemindedAt: null },
  ];
}

export function loadReminders(): ImportReminder[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultReminders();
    const list = JSON.parse(raw) as ImportReminder[];
    return Array.isArray(list) && list.length ? list : defaultReminders();
  } catch {
    return defaultReminders();
  }
}

export function saveReminders(reminders: ImportReminder[]): void {
  localStorage.setItem(KEY, JSON.stringify(reminders));
}

export function setReminderEnabled(source: string, enabled: boolean): void {
  const next = loadReminders().map((r) =>
    r.source === source ? { ...r, enabled } : r,
  );
  saveReminders(next);
}

export function dueReminders(now = new Date()): ImportReminder[] {
  return loadReminders().filter((r) => {
    if (!r.enabled) return false;
    if (!r.lastRemindedAt) return true;
    const last = new Date(r.lastRemindedAt).getTime();
    if (Number.isNaN(last)) return true;
    const ms = r.cadenceDays * 24 * 60 * 60 * 1000;
    return now.getTime() - last >= ms;
  });
}
