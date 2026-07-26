import type { ProfileVault } from "../vault";
import { clearDriveIdentity } from "../sync/drive/identity";
import { bindDriveSettings, renderDriveSettingsHtml } from "../sync/drive/DriveSettingsPanel";
import {
  connectDriveAndMerge,
  saveVaultToDrive,
  getConnectedDriveAccount,
} from "../sync/drive/vaultSync";
import { reconcileVault } from "../sync/drive/reconcile";
import { LOCAL_PROFILE_ID, setActiveProfileId } from "../vault/persist/profileKey";

/** Mount Google Drive sync panel on Settings route. */
export function bindDrivePanel(
  root: HTMLElement,
  vault: ProfileVault,
  onChange: () => void,
): void {
  const mount = root.querySelector("[data-drive-settings-mount]");
  if (mount) mount.innerHTML = renderDriveSettingsHtml();

  bindDriveSettings(root, {
    onConnect: () => {
      void connectDriveAndMerge(vault)
        .then(({ identity, result }) => {
          const mountEl = root.querySelector("[data-drive-settings-mount]");
          if (mountEl) mountEl.innerHTML = renderDriveSettingsHtml();
          bindDrivePanel(root, vault, onChange);
          onChange();
          const status = root.querySelector("[data-drive-status]");
          if (status) {
            status.textContent = `Connected as ${identity.email}. ${result.message} (${result.evidenceCount} evidence).`;
          }
        })
        .catch((e) => {
          const status = root.querySelector("[data-drive-status]");
          if (status) status.textContent = e instanceof Error ? e.message : String(e);
        });
    },
    onSyncNow: () => {
      const status = root.querySelector("[data-drive-status]");
      if (status) status.textContent = "Syncing…";
      const connected = getConnectedDriveAccount() != null;
      const work = connected ? reconcileVault(vault) : connectDriveAndMerge(vault);
      void work
        .then((result) => {
          const mountEl = root.querySelector("[data-drive-settings-mount]");
          if (mountEl) mountEl.innerHTML = renderDriveSettingsHtml();
          bindDrivePanel(root, vault, onChange);
          onChange();
          if (status) {
            if ("identity" in result) {
              const { identity, result: r } = result;
              status.textContent = `Connected as ${identity.email}. ${r.message} (${r.evidenceCount} evidence).`;
            } else {
              status.textContent = result.message;
            }
          }
        })
        .catch((e) => {
          if (status) status.textContent = e instanceof Error ? e.message : String(e);
        });
    },
    onDisconnect: () => {
      clearDriveIdentity();
      setActiveProfileId(LOCAL_PROFILE_ID);
      vault.setProfileId(LOCAL_PROFILE_ID);
      void vault.reloadFromStore().then(() => {
        const mountEl = root.querySelector("[data-drive-settings-mount]");
        if (mountEl) mountEl.innerHTML = renderDriveSettingsHtml();
        bindDrivePanel(root, vault, onChange);
        onChange();
      });
    },
    onSave: () => {
      void saveVaultToDrive(vault)
        .then((r) => {
          const status = root.querySelector("[data-drive-status]");
          if (status) status.textContent = r.message;
        })
        .catch((e) => {
          const status = root.querySelector("[data-drive-status]");
          if (status) status.textContent = e instanceof Error ? e.message : String(e);
        });
    },
    onRestore: () => {
      void reconcileVault(vault)
        .then((r) => {
          const status = root.querySelector("[data-drive-status]");
          if (status) status.textContent = r.message;
          onChange();
        })
        .catch((e) => {
          const status = root.querySelector("[data-drive-status]");
          if (status) status.textContent = e instanceof Error ? e.message : String(e);
        });
    },
    onStatus: () => {},
  });
}

export function driveSettingsMountHtml(): string {
  return `<div data-drive-settings-mount></div>`;
}
