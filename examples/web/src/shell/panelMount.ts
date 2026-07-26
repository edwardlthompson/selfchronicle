import { APP_VERSION } from "../about/aboutSession";
import type { DonationConfig } from "../about/types";
import { createAboutPanel } from "../components/AboutPanel";
import { createSettingsPanel } from "../components/SettingsPanel";
import { renderImportView } from "../import/ImportView";
import { getImportReview } from "../import/session";
import { bindPanelDialog } from "../panelDialog";
import { t } from "../i18n";
import type { VaultStatus } from "../vault";

export function renderVaultPanelHtml(vault: VaultStatus | null): string {
  const count = vault?.evidenceCount ?? 0;
  const path = vault?.rootLabel ?? t("vault.path.unknown");
  return `<section data-testid="vault-panel" class="sc-stack">
    <p class="sc-path-hint">${t("vault.path.label")}: ${path}</p>
    <p class="gp-body">${t("vault.evidence_count")}: ${count}</p>
    <p class="gp-body">${t("first_run.body")}</p>
    ${renderImportView(getImportReview())}
  </section>`;
}

export function mountSettingsOrAbout(
  mount: Element,
  opts: {
    showSettings: boolean;
    showAbout: boolean;
    updateStatus: string;
    donations: DonationConfig;
    canApplyUpdate?: boolean;
    onCloseSettings: () => void;
    onCloseAbout: () => void;
    onUpdateCheckChange?: (enabled: boolean) => void;
    onApplyUpdate?: () => void;
  },
): (() => void) | undefined {
  mount.innerHTML = "";
  if (opts.showSettings) {
    const panel = createSettingsPanel({
      onClose: opts.onCloseSettings,
      onUpdateCheckChange: opts.onUpdateCheckChange,
    });
    mount.appendChild(panel);
    return bindPanelDialog(panel, opts.onCloseSettings);
  }
  if (!opts.showAbout) return undefined;
  mount.appendChild(
    createAboutPanel(
      {
        version: APP_VERSION,
        updateStatus: opts.updateStatus,
        donations: opts.donations,
        canApplyUpdate: opts.canApplyUpdate,
      },
      opts.onCloseAbout,
      opts.onApplyUpdate,
    ),
  );
  return bindPanelDialog(mount.lastElementChild as HTMLElement, opts.onCloseAbout);
}
