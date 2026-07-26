import type { CognitionProfile } from "../../cognition/profile";
import { bandLabels } from "../../cognition/profile";
import { t } from "../../i18n";

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** CG-01: Cognition hub — bandwidth bands UI, no IQ score. */
export function renderCognitionView(profile: CognitionProfile): string {
  const bands = bandLabels(profile)
    .map((b) => `<li class="sc-band">${escape(b)}</li>`)
    .join("");

  return `<section data-testid="cognition-profile" data-enabled="${profile.enabled}">
    <h2>${escape(t("cognition.title"))}</h2>
    <p class="sc-disclaimer" data-testid="cognition-disclaimer">${escape(profile.disclaimer)}</p>
    <span class="sc-badge" data-testid="cognition-provisional">${escape(t("cognition.provisional"))}</span>
    <ul class="sc-bandwidth-bands" data-testid="cognition-bands">${bands}</ul>
    <p class="sc-meta">${escape(t("cognition.deep_work"))}: ${escape(profile.deepWorkWindow)}</p>
  </section>`;
}
