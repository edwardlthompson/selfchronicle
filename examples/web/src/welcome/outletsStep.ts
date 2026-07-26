import { t } from "../i18n";
import { renderImportSourcesGuide } from "../import/ImportSourcesGuide";
import { getImportSelectedFormat } from "../import/session";
import {
  drivePanel,
  githubPanel,
  linksPanel,
  pastePanel,
  welcomeErrorHtml,
  escapeWelcomeHtml,
} from "./outletPanels";
import type { WelcomeModel, WelcomeOutlet } from "./types";

type OutletDef = { id: Exclude<WelcomeOutlet, "">; labelKey: string; benefitKey: string };

const OUTLETS: OutletDef[] = [
  { id: "github", labelKey: "welcome.outlet_github_label", benefitKey: "welcome.outlet_github_benefit" },
  {
    id: "linkslander",
    labelKey: "welcome.outlet_linkslander_label",
    benefitKey: "welcome.outlet_linkslander_benefit",
  },
  { id: "drive", labelKey: "welcome.outlet_drive_label", benefitKey: "welcome.outlet_drive_benefit" },
  {
    id: "chatgpt",
    labelKey: "welcome.outlet_chatgpt_label",
    benefitKey: "welcome.outlet_chatgpt_benefit",
  },
  { id: "paste", labelKey: "welcome.outlet_paste_label", benefitKey: "welcome.outlet_paste_benefit" },
];

function outletCard(o: OutletDef, active: WelcomeOutlet): string {
  const selected = active === o.id ? " is-active" : "";
  return `<button type="button" class="sc-outlet${selected}" data-welcome-outlet="${o.id}">
    <span class="sc-outlet-label">${t(o.labelKey)}</span>
    <span class="sc-outlet-benefit">${t(o.benefitKey)}</span>
  </button>`;
}

export function outletsStepHtml(m: WelcomeModel): string {
  const cards = OUTLETS.map((o) => outletCard(o, m.outlet)).join("");
  const sources = renderImportSourcesGuide({
    compact: true,
    selectedFormat: m.selectedFormat || getImportSelectedFormat(),
  });
  return `<section data-testid="welcome-outlets" class="sc-stack sc-welcome">
    <h2>${t("welcome.outlets_title")}</h2>
    <p class="gp-body">${t("welcome.outlets_body")}</p>
    <div class="sc-outlet-list" data-testid="welcome-outlet-list">${cards}</div>
    ${sources}
    ${welcomeErrorHtml(m)}
    ${githubPanel(m)}
    ${linksPanel(m)}
    ${drivePanel(m)}
    ${pastePanel(m, "chatgpt")}
    ${pastePanel(m, "paste")}
    <button type="button" class="sc-btn" data-welcome-back>${t("welcome.back")}</button>
    <button type="button" class="sc-btn" data-welcome-skip>${t("welcome.skip")}</button>
  </section>`;
}

export { escapeWelcomeHtml };
