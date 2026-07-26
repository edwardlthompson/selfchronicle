import { t } from "../i18n";

export function renderHandoffView(preview: string): string {
  return `<section data-testid="handoff-home">
    <h2>${t("handoff.title")}</h2>
    <p class="gp-body">${t("handoff.intro")}</p>
    <button type="button" data-handoff-build>${t("handoff.build")}</button>
    <pre data-testid="handoff-preview">${escape(preview)}</pre>
  </section>`;
}

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
