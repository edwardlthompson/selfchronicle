export type DayCloseSettings = {
  enabled: boolean;
  windowStart: string; // HH:mm
  windowEnd: string;
  snoozeMinutes: number;
  focusMode: boolean;
  maxQuestions: 3;
};

export const DEFAULT_DAY_CLOSE: DayCloseSettings = {
  enabled: false,
  windowStart: "21:00",
  windowEnd: "23:30",
  snoozeMinutes: 20,
  focusMode: false,
  maxQuestions: 3,
};

const KEY = "sc.dayClose.settings";

export function loadDayCloseSettings(): DayCloseSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_DAY_CLOSE };
    const parsed = JSON.parse(raw) as Partial<DayCloseSettings>;
    return {
      ...DEFAULT_DAY_CLOSE,
      ...parsed,
      maxQuestions: 3,
    };
  } catch {
    return { ...DEFAULT_DAY_CLOSE };
  }
}

export function saveDayCloseSettings(next: DayCloseSettings): void {
  localStorage.setItem(KEY, JSON.stringify({ ...next, maxQuestions: 3 }));
}

function parseHm(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** True when local time is inside [start, end], including overnight windows. */
export function inEveningWindow(
  settings: DayCloseSettings,
  now = new Date(),
): boolean {
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = parseHm(settings.windowStart);
  const end = parseHm(settings.windowEnd);
  if (start <= end) return cur >= start && cur <= end;
  return cur >= start || cur <= end;
}

export function shouldOfferDayClose(
  settings: DayCloseSettings,
  snoozeUntilMs: number | null,
  now = new Date(),
): boolean {
  if (!settings.enabled || settings.focusMode) return false;
  if (snoozeUntilMs != null && now.getTime() < snoozeUntilMs) return false;
  return inEveningWindow(settings, now);
}
