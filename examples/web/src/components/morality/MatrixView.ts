import type { MoralityMatrix } from "../../morality/matrix";
import { t } from "../../i18n";

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** MM-01: Morality matrix hub — priorities, not a moral grade. */
export function renderMatrixView(matrix: MoralityMatrix): string {
  const axes = matrix.axes
    .map(
      (ax) => `<li data-axis="${escape(ax.id)}">
      <span class="sc-axis-label">${escape(ax.label)}</span>
      <span class="sc-axis-placement" data-testid="axis-${escape(ax.id)}">${ax.placement}</span>
      ${ax.user_edited ? `<span class="sc-badge">${escape(t("morality.user_edited"))}</span>` : ""}
      <span class="sc-badge" data-testid="axis-provisional">${escape(t("morality.provisional"))}</span>
    </li>`,
    )
    .join("");

  return `<section data-testid="morality-matrix" data-enabled="${matrix.enabled}">
    <h2>${escape(t("morality.title"))}</h2>
    <p class="sc-disclaimer" data-testid="morality-disclaimer">${escape(matrix.disclaimer)}</p>
    <p class="sc-lede">${escape(t("morality.lede"))}</p>
    <ul class="sc-matrix-axes">${axes}</ul>
  </section>`;
}
