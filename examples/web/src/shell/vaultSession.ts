import type { ProfileVault } from "../vault";
import { setVaultAfterPersistHook } from "../vault/persist/syncHook";
import { googleProfileId, setActiveProfileId } from "../vault/persist/profileKey";
import {
  pushVaultAfterCommit,
  reconcileVaultOnStartup,
} from "../sync/drive/reconcile";
import { loadDriveIdentity } from "../sync/drive/identity";
import type { WelcomeSession } from "../welcome/session";
import type { AppShellState } from "../AppShell";
import { maybeDebugSeedImport } from "../debug/seedImport";
import { gateFirstRun } from "./bootVault";

/** Init Drive profile, persist hook, reconcile local+cloud, then first-run gate. */
export function startVaultSession(
  vault: ProfileVault,
  opts: {
    welcome: WelcomeSession;
    state: AppShellState;
    setState: (s: AppShellState) => void;
    render: () => void;
    refreshVaultUi: () => Promise<void>;
  },
): void {
  const driveIdentity = loadDriveIdentity();
  if (driveIdentity) setActiveProfileId(googleProfileId(driveIdentity.sub));

  setVaultAfterPersistHook((v) => {
    void pushVaultAfterCommit(v);
  });

  void reconcileVaultOnStartup(vault).then(async () => {
    try {
      await maybeDebugSeedImport(vault);
    } catch (e) {
      console.warn("[debug-seed] import skipped", e);
    }
    await gateFirstRun({
      vault,
      welcome: opts.welcome,
      state: opts.state,
      setState: opts.setState,
      render: opts.render,
      refreshVaultUi: opts.refreshVaultUi,
    });
  });
}
