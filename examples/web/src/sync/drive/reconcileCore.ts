import type { ProfileVault } from "../../vault";
import { mergeSnapshots } from "../../vault/persist/mergeSnapshots";
import type { VaultSnapshot } from "../../vault/persist/types";
import { emptySnapshot } from "../../vault/persist/types";
import {
  googleProfileId,
  LOCAL_PROFILE_ID,
  setActiveProfileId,
} from "../../vault/persist/profileKey";
import type { VaultStore } from "../../vault/persist/store";
import { scheduleBioDistill } from "../../profile/bioVault";
import { resolveStore } from "./reconcileStore";
import { requestGoogleAccessToken } from "./auth";
import { downloadDrivePack, uploadDrivePack } from "./client";
import type { DrivePackEnvelope } from "./vaultSync";
import { envelopeFromVault } from "./vaultSync";

export type ReconcileResult = {
  merged: boolean;
  pushed: boolean;
  message: string;
  evidenceCount: number;
};

function parseDriveSnapshot(raw: string): VaultSnapshot | null {
  try {
    const env = JSON.parse(raw) as DrivePackEnvelope;
    if (env.snapshot?.files) return env.snapshot;
  } catch {
    return null;
  }
  return null;
}

async function loadProfileSnapshot(
  store: VaultStore,
  profileId: string,
): Promise<VaultSnapshot> {
  return (await store.load(profileId)) ?? emptySnapshot();
}

/** Local IDB first, merge Drive + pre-sign-in local; persist; push when changed. */
export async function reconcileVaultWithStore(
  vault: ProfileVault,
  store: VaultStore,
  profileId: string,
  token: string | null,
): Promise<{ merged: VaultSnapshot; pushed: boolean }> {
  let merged = await loadProfileSnapshot(store, profileId);
  const before = JSON.stringify(merged.files);

  if (profileId !== LOCAL_PROFILE_ID) {
    const localOnly = await loadProfileSnapshot(store, LOCAL_PROFILE_ID);
    if (Object.keys(localOnly.files).length > 0) {
      merged = mergeSnapshots(merged, localOnly);
    }
  }

  if (token) {
    const raw = await downloadDrivePack(token, profileId);
    if (raw) {
      const remote = parseDriveSnapshot(raw);
      if (remote) merged = mergeSnapshots(merged, remote);
    }
  }

  vault.importSnapshot(merged);
  await vault.persistNow();
  await vault.reloadFromStore();

  let pushed = false;
  const changed = JSON.stringify(merged.files) !== before || !token;
  if (token && changed) {
    try {
      await uploadDrivePack(token, profileId, JSON.stringify(envelopeFromVault(vault)));
      pushed = true;
    } catch {
      pushed = false;
    }
  }
  return { merged, pushed };
}

export async function finalizeReconcile(
  vault: ProfileVault,
  merged: boolean,
  pushed: boolean,
): Promise<ReconcileResult> {
  scheduleBioDistill(vault);
  const status = await vault.status();
  return {
    merged,
    pushed,
    message: pushed ? "Vault merged and synced to Drive" : "Vault merged locally",
    evidenceCount: status.evidenceCount,
  };
}

export async function reconcileVault(vault: ProfileVault): Promise<ReconcileResult> {
  const store = resolveStore(vault);
  const profileId = vault.getProfileId();
  let token: string | null = null;
  try {
    token = await requestGoogleAccessToken();
  } catch {
    token = null;
  }
  const { pushed } = await reconcileVaultWithStore(vault, store, profileId, token);
  return finalizeReconcile(vault, true, pushed);
}

export function applyProfileFromIdentity(sub: string, vault: ProfileVault): string {
  const profileId = googleProfileId(sub);
  setActiveProfileId(profileId);
  vault.setProfileId(profileId);
  return profileId;
}
