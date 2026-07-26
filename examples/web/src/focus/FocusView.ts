import { t } from "../i18n";
import { cuesSuppressed, inQuietHours, type FocusQuietSettings } from "./settings";

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderFocusChip(settings: FocusQuietSettings): string {
  if (!settings.focusMode) return "";
  return `<p class="sc-focus-chip" data-testid="focus-chip" role="status">${t("focus.chip")}</p>`;
}

export function renderQuietBanner(settings: FocusQuietSettings, now = new Date()): string {
  if (settings.focusMode || !inQuietHours(settings, now)) return "";
  return `<p class="sc-quiet-banner" data-testid="quiet-banner" role="status">${t("focus.quiet_banner")}</p>`;
}

export function renderFocusSettings(settings: FocusQuietSettings): string {
  return `<section data-testid="focus-settings" class="sc-stack">
    <h3>${t("focus.title")}</h3>
    <p class="gp-body">${t("focus.no_ide")}</p>
    <label class="sc-field">
      <input type="checkbox" data-focus-mode ${settings.focusMode ? "checked" : ""}/>
      <span>${t("focus.toggle")}</span>
    </label>
    <label class="sc-field sc-field-row">
      <span>${t("focus.quiet_start")}</span>
      <input type="time" data-quiet-start value="${escape(settings.quietStart)}"/>
    </label>
    <label class="sc-field sc-field-row">
      <span>${t("focus.quiet_end")}</span>
      <input type="time" data-quiet-end value="${escape(settings.quietEnd)}"/>
    </label>
    <p class="gp-body" data-testid="focus-status">${
      cuesSuppressed(settings) ? t("focus.suppressed") : t("focus.open")
    }</p>
  </section>`;
}
