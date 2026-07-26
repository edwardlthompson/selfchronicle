/** UI locale vs vault/ritual locale — kept separate on purpose. */

export type LocalePair = {
  uiLocale: string;
  vaultLocale: string;
};

const KEY = "sc.i18n.locale-pair";

export function defaultLocalePair(): LocalePair {
  return { uiLocale: "en", vaultLocale: "en" };
}

export function loadLocalePair(): LocalePair {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultLocalePair();
    const parsed = JSON.parse(raw) as Partial<LocalePair>;
    return {
      uiLocale: String(parsed.uiLocale ?? "en") || "en",
      vaultLocale: String(parsed.vaultLocale ?? "en") || "en",
    };
  } catch {
    return defaultLocalePair();
  }
}

export function saveLocalePair(pair: LocalePair): void {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      uiLocale: pair.uiLocale.trim() || "en",
      vaultLocale: pair.vaultLocale.trim() || "en",
    }),
  );
}

export function setUiLocale(locale: string): void {
  saveLocalePair({ ...loadLocalePair(), uiLocale: locale });
}

export function setVaultLocale(locale: string): void {
  saveLocalePair({ ...loadLocalePair(), vaultLocale: locale });
}

export function localesDiffer(pair = loadLocalePair()): boolean {
  return pair.uiLocale !== pair.vaultLocale;
}
