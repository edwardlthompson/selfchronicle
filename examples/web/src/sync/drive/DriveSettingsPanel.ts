import { t } from "../../i18n";
import { isDriveConfigured } from "./config";
import { getConnectedDriveAccount } from "./vaultSync";

export type DrivePanelCallbacks = {
  onConnect: () => void;
  onSyncNow: () => void;
  onDisconnect: () => void;
  onSave: () => void;
  onRestore: () => void;
  onStatus: (msg: string) => void;
};

export function renderDriveSettingsHtml(): string {
  const identity = getConnectedDriveAccount();
  const configured = isDriveConfigured();
  const connected = identity != null;

  if (!configured) {
    return `<section class="sc-drive-panel sc-stack" data-testid="drive-settings">
      <h3>${t("drive.title")}</h3>
      <p class="gp-body">${t("drive.not_configured")}</p>
      <p class="gp-body"><strong>${t("drive.setup_heading")}</strong></p>
      <ol class="gp-body sc-drive-setup">
        <li>${t("drive.setup_1")}</li>
        <li>${t("drive.setup_2")}</li>
        <li>${t("drive.setup_3")}</li>
        <li>${t("drive.setup_4")}</li>
        <li>${t("drive.setup_5")}</li>
      </ol>
    </section>`;
  }

  const account = connected
    ? `<p class="gp-body" data-testid="drive-account">${t("drive.connected_as")} <strong>${escapeHtml(identity.email)}</strong></p>`
    : `<p class="gp-body">${t("drive.disconnected")}</p>`;

  return `<section class="sc-drive-panel sc-stack" data-testid="drive-settings">
    <h3>${t("drive.title")}</h3>
    <p class="gp-body">${t("drive.body")}</p>
    ${account}
    <p class="gp-body sc-drive-status" data-drive-status role="status"></p>
    <div class="sc-stack sc-drive-actions">
      <button type="button" class="sc-btn sc-btn-primary" data-drive-sync-now>${t("drive.sync_now")}</button>
      <p class="gp-body sc-muted">${t("drive.sync_now_hint")}</p>
      ${
        connected
          ? `<button type="button" class="sc-btn" data-drive-disconnect>${t("drive.disconnect")}</button>`
          : `<button type="button" class="sc-btn" data-drive-connect>${t("drive.connect")}</button>`
      }
      <button type="button" class="sc-btn" data-drive-save ${connected ? "" : "disabled"}>${t("drive.save")}</button>
      <button type="button" class="sc-btn" data-drive-restore ${connected ? "" : "disabled"}>${t("drive.restore")}</button>
    </div>
    <p class="gp-body sc-muted">${t("drive.cleartext_todo")}</p>
    <p class="gp-body sc-muted">${t("drive.merge_note")}</p>
  </section>`;
}

function escapeHtml(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function bindDriveSettings(root: HTMLElement, cb: DrivePanelCallbacks): void {
  const panel = root.querySelector("[data-testid='drive-settings']");
  if (!panel) return;

  panel.querySelector("[data-drive-sync-now]")?.addEventListener("click", () => cb.onSyncNow());
  panel.querySelector("[data-drive-connect]")?.addEventListener("click", () => cb.onConnect());
  panel.querySelector("[data-drive-disconnect]")?.addEventListener("click", () => cb.onDisconnect());
  panel.querySelector("[data-drive-save]")?.addEventListener("click", () => cb.onSave());
  panel.querySelector("[data-drive-restore]")?.addEventListener("click", () => cb.onRestore());
}
