/** Accessibility preferences for Day Close and motion. */

export type A11yPrefs = {
  reducedMotion: boolean;
  keyboardDayClose: boolean;
};

const KEY = "sc.a11y.prefs";

export function defaultA11yPrefs(): A11yPrefs {
  return { reducedMotion: false, keyboardDayClose: true };
}

export function loadA11yPrefs(): A11yPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultA11yPrefs();
    const parsed = JSON.parse(raw) as Partial<A11yPrefs>;
    return {
      reducedMotion: Boolean(parsed.reducedMotion),
      keyboardDayClose:
        parsed.keyboardDayClose === undefined
          ? true
          : Boolean(parsed.keyboardDayClose),
    };
  } catch {
    return defaultA11yPrefs();
  }
}

export function saveA11yPrefs(prefs: A11yPrefs): void {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      reducedMotion: Boolean(prefs.reducedMotion),
      keyboardDayClose: Boolean(prefs.keyboardDayClose),
    }),
  );
}

export function setReducedMotion(on: boolean): void {
  saveA11yPrefs({ ...loadA11yPrefs(), reducedMotion: on });
}

export function setKeyboardDayClose(on: boolean): void {
  saveA11yPrefs({ ...loadA11yPrefs(), keyboardDayClose: on });
}
