import { t } from "../i18n";
import { getImportSelectedFormat } from "../import/session";
import { escapeWelcomeHtml, outletsStepHtml } from "./outletsStep";
import type { WelcomeModel } from "./types";

export type { WelcomeModel, WelcomeOutlet, WelcomeStep } from "./types";

export function defaultWelcomeModel(): WelcomeModel {
  return {
    step: "privacy",
    outlet: "",
    username: "",
    siteUrl: "",
    pasteRaw: "",
    busy: false,
    error: "",
    previewCount: 0,
    sampleTitles: [],
    hasLinksLander: false,
    enrichLinkedOnCommit: false,
    committed: "",
    selectedFormat: getImportSelectedFormat(),
  };
}

export function renderWelcomeView(m: WelcomeModel): string {
  if (m.step === "privacy") {
    return `<section data-testid="welcome-home" class="sc-stack sc-welcome">
      <h2>${t("welcome.title")}</h2>
      <p class="gp-body">${t("trust.privacy_body")}</p>
      <p class="gp-body">${t("welcome.privacy_extra")}</p>
      <button type="button" class="sc-btn" data-welcome-next>${t("welcome.continue")}</button>
      <button type="button" class="sc-btn" data-welcome-skip>${t("welcome.skip")}</button>
    </section>`;
  }
  if (m.step === "outlets") return outletsStepHtml(m);
  if (m.step === "review") {
    const samples = m.sampleTitles.map((x) => `<li>${escapeWelcomeHtml(x)}</li>`).join("");
    return `<section data-testid="welcome-review" class="sc-stack sc-welcome">
      <h2>${t("welcome.review_title")}</h2>
      <p class="gp-body">${t("import.review_count")}: ${m.previewCount}</p>
      ${m.hasLinksLander ? `<p class="gp-body">${t("welcome.linkslander_found")}</p>` : ""}
      <label class="sc-field sc-welcome-enrich">
        <input type="checkbox" data-welcome-enrich-linked ${m.enrichLinkedOnCommit ? "checked" : ""} />
        <span>${t("welcome.enrich_linked_label")}</span>
      </label>
      <p class="gp-body sc-welcome-enrich-hint">${t("welcome.enrich_linked_hint")}</p>
      <ul>${samples}</ul>
      <p class="gp-body">${t("welcome.provisional")}</p>
      <button type="button" class="sc-btn" data-welcome-commit ${m.busy ? "disabled" : ""}>
        ${m.busy ? t("welcome.committing") : t("import.commit")}
      </button>
      <button type="button" class="sc-btn" data-welcome-back>${t("welcome.back")}</button>
    </section>`;
  }
  return `<section data-testid="welcome-done" class="sc-stack sc-welcome">
    <h2>${t("welcome.done_title")}</h2>
    <p class="gp-body">${escapeWelcomeHtml(m.committed || t("welcome.done_body"))}</p>
    <p class="gp-body">${t("welcome.import_hint")}</p>
    <button type="button" class="sc-btn" data-welcome-finish>${t("welcome.open_vault")}</button>
  </section>`;
}
