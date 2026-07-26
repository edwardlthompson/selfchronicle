import { t } from "../i18n";
import { getImportSource } from "./ImportSourcesCatalog";
import { renderImportSourcesGuide } from "./ImportSourcesGuide";
import { getImportSelectedFormat } from "./session";
import type { ImportReview } from "./types";

export function renderImportView(review: ImportReview | null): string {
  const format = getImportSelectedFormat();
  const src = getImportSource(format);
  const formatLabel = src ? t(src.nameKey) : format;
  const guide = `<ol class="sc-import-guide">${[
    t("import.guide_1"),
    t("import.guide_2"),
    t("import.guide_3"),
  ]
    .map((s) => `<li>${s}</li>`)
    .join("")}</ol>`;
  const reviewBlock = review
    ? `<div data-testid="import-review">
        <p>${t("import.review_count")}: ${review.count}</p>
        <p>${t("import.parser")}: ${review.parser_version}</p>
        <ul>${review.sampleTitles.map((x) => `<li>${x}</li>`).join("")}</ul>
        <button type="button" data-import-commit>${t("import.commit")}</button>
        <button type="button" data-import-cancel>${t("import.cancel")}</button>
      </div>`
    : "";
  return `<section data-testid="import-panel" class="sc-stack">
    <h2>${t("import.title")}</h2>
    ${guide}
    ${renderImportSourcesGuide({ selectedFormat: format })}
    <p class="gp-body" data-testid="import-format-selected">${t("import.selected_format")}: <strong>${formatLabel}</strong> <code>${format}</code></p>
    <p class="gp-body">${t("import.github_cta")}</p>
    <button type="button" class="sc-btn" data-import-open-welcome>${t("import.open_github_welcome")}</button>
    <label class="sc-field sc-field-row">
      <span>${t("import.file_label")}</span>
      <input type="file" accept="application/json,.json,.zip" data-import-file />
    </label>
    <p class="gp-body">${t("import.file_hint")}</p>
    <label class="sc-field sc-field-row">${t("import.paste_label")}<textarea class="sc-textarea" data-import-raw rows="6"></textarea></label>
    <button type="button" class="sc-btn" data-import-parse-selected>${t("import.parse_selected")}</button>
    <button type="button" class="sc-btn" data-import-parse-paste>${t("import.parse_paste")}</button>
    <button type="button" class="sc-btn" data-import-parse-chatgpt>${t("import.parse_chatgpt")}</button>
    ${reviewBlock}
  </section>`;
}
