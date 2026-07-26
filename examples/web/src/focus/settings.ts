/** Focus + quiet hours — user-owned; never IDE telemetry. */

export type FocusQuietSettings = {
  focusMode: boolean;
  quietStart: string;
  quietEnd: string;
};

export const DEFAULT_FOCUS_QUIET: FocusQuietSettings = {
  focusMode: false,
  quietStart: "23:30",
  quietEnd: "07:00",
};

const KEY = "sc.focusQuiet.settings";

export function loadFocusQuiet(): FocusQuietSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_FOCUS_QUIET };
    return { ...DEFAULT_FOCUS_QUIET, ...(JSON.parse(raw) as Partial<FocusQuietSettings>) };
  } catch {
    return { ...DEFAULT_FOCUS_QUIET };
  }
}

export function saveFocusQuiet(next: FocusQuietSettings): void {
  localStorage.setItem(KEY, JSON.stringify(next));
}

function parseHm(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Inclusive quiet window; supports overnight ranges. */
export function inQuietHours(settings: FocusQuietSettings, now = new Date()): boolean {
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = parseHm(settings.quietStart);
  const end = parseHm(settings.quietEnd);
  if (start === end) return false;
  if (start < end) return cur >= start && cur < end;
  return cur >= start || cur < end;
}

export function cuesSuppressed(settings: FocusQuietSettings, now = new Date()): boolean {
  return settings.focusMode || inQuietHours(settings, now);
}
