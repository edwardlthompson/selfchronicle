import type { SoftDoc } from "../../soft/flags";
import { t } from "../../i18n";

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** PD-05–07: Personality + Wellbeing provisional panels. */
export function renderSoftPanels(personality: SoftDoc, wellbeing: SoftDoc): string {
  return `<section data-testid="soft-panels">
    <h2>${t("learn.personality")}</h2>
    <p class="sc-disclaimer" data-testid="personality-disclaimer">${escape(personality.disclaimer)}</p>
    <span class="sc-badge" data-testid="personality-provisional">${t("learn.provisional")}</span>
    <textarea data-soft-personality rows="3">${escape(personality.body)}</textarea>
    <button type="button" data-soft-save-personality>${t("learn.save_soft")}</button>
    <h2>${t("learn.wellbeing")}</h2>
    <p class="sc-disclaimer" data-testid="wellbeing-disclaimer">${escape(wellbeing.disclaimer)}</p>
    <span class="sc-badge" data-testid="wellbeing-provisional">${t("learn.provisional")}</span>
    <label><input type="checkbox" data-soft-wb-enabled ${wellbeing.enabled ? "checked" : ""}/> ${t("learn.wb_enable")}</label>
    <textarea data-soft-wellbeing rows="2">${escape(wellbeing.body)}</textarea>
    <button type="button" data-soft-save-wellbeing>${t("learn.save_soft")}</button>
  </section>`;
}
