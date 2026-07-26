import type { ProfileVault } from "../../vault";
import { connectGoogleDrive, requestGoogleAccessToken } from "./auth";
import { isDriveConfigured } from "./config";
import type { DriveIdentity } from "./identity";
import { loadDriveIdentity } from "./identity";
import {
  applyProfileFromIdentity,
  finalizeReconcile,
  reconcileVault,
  reconcileVaultWithStore,
  type ReconcileResult,
} from "./reconcileCore";
import { resolveStore } from "./reconcileStore";
import { envelopeFromVault } from "./vaultSync";
import { uploadDrivePack } from "./client";

export type { ReconcileResult } from "./reconcileCore";

/** Fire-and-forget push after any vault commit when Drive is connected. */
export async function pushVaultAfterCommit(vault: ProfileVault): Promise<void> {
  if (!loadDriveIdentity() || !isDriveConfigured()) return;
  try {
    const token = await requestGoogleAccessToken();
    await uploadDrivePack(
      token,
      vault.getProfileId(),
      JSON.stringify(envelopeFromVault(vault)),
    );
  } catch {
    /* offline — local IDB remains truth until next reconcile */
  }
}

/** Sign in, merge local + Drive into google:{sub} namespace. */
export async function connectDriveAndMerge(
  vault: ProfileVault,
): Promise<{ identity: DriveIdentity; result: ReconcileResult }> {
  const { identity } = await connectGoogleDrive();
  applyProfileFromIdentity(identity.sub, vault);
  await vault.reloadFromStore();
  const store = resolveStore(vault);
  const profileId = vault.getProfileId();
  const token = await requestGoogleAccessToken();
  const { pushed } = await reconcileVaultWithStore(vault, store, profileId, token);
  const result = await finalizeReconcile(vault, true, pushed);
  return { identity, result };
}

export async function reconcileVaultOnStartup(vault: ProfileVault): Promise<ReconcileResult> {
  await vault.open(`idb://${vault.getProfileId()}`);
  if (!loadDriveIdentity() || !isDriveConfigured()) {
    const status = await vault.status();
    return {
      merged: false,
      pushed: false,
      message: "Restored from local storage",
      evidenceCount: status.evidenceCount,
    };
  }
  applyProfileFromIdentity(loadDriveIdentity()!.sub, vault);
  return reconcileVault(vault);
}

export { reconcileVault } from "./reconcileCore";
