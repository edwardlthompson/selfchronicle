import type { ProfileVault } from "../../vault";
import { mergeSnapshots } from "../../vault/persist/mergeSnapshots";
import type { VaultSnapshot } from "../../vault/persist/types";
import { googleProfileId, setActiveProfileId } from "../../vault/persist/profileKey";
import { requestGoogleAccessToken } from "./auth";
import { downloadDrivePack, uploadDrivePack, drivePackPath } from "./client";
import { DRIVE_PACK_CLEARTEXT } from "./config";
import type { DriveIdentity } from "./identity";
import { loadDriveIdentity } from "./identity";
import { connectDriveAndMerge } from "./reconcile";

export type DriveSyncResult = {
  ok: boolean;
  message: string;
  path?: string;
};

export type DrivePackEnvelope = {
  /** Cleartext provisional — TODO: age-encrypt before upload. */
  ciphertext: false;
  profile_id: string;
  exported_at: string;
  snapshot: VaultSnapshot;
};

export function envelopeFromVault(vault: ProfileVault): DrivePackEnvelope {
  return {
    ciphertext: DRIVE_PACK_CLEARTEXT ? false : false,
    profile_id: vault.getProfileId(),
    exported_at: new Date().toISOString(),
    snapshot: vault.exportSnapshot(),
  };
}

export function applyDriveEnvelope(raw: string): VaultSnapshot {
  const env = JSON.parse(raw) as DrivePackEnvelope;
  if (!env.snapshot?.files) throw new Error("drive_pack_invalid");
  return env.snapshot;
}

export async function saveVaultToDrive(vault: ProfileVault): Promise<DriveSyncResult> {
  const token = await requestGoogleAccessToken();
  const json = JSON.stringify(envelopeFromVault(vault));
  const fileId = await uploadDrivePack(token, vault.getProfileId(), json);
  return {
    ok: true,
    message: "Saved to Google Drive",
    path: `${drivePackPath(vault.getProfileId())} (${fileId})`,
  };
}

export async function restoreVaultFromDrive(vault: ProfileVault): Promise<DriveSyncResult> {
  const token = await requestGoogleAccessToken();
  const raw = await downloadDrivePack(token, vault.getProfileId());
  if (!raw) return { ok: false, message: "No vault pack found on Drive for this account" };
  const remote = applyDriveEnvelope(raw);
  const merged = mergeSnapshots(vault.exportSnapshot(), remote);
  vault.importSnapshot(merged);
  await vault.persistNow();
  await vault.reloadFromStore();
  return {
    ok: true,
    message: "Merged vault from Google Drive",
    path: drivePackPath(vault.getProfileId()),
  };
}

/** @deprecated Use connectDriveAndMerge from reconcile.ts */
export async function connectDriveAndRestore(
  vault: ProfileVault,
  opts: { pullFromDrive?: boolean } = {},
): Promise<{ identity: DriveIdentity; restored: boolean }> {
  void opts;
  const { identity, result } = await connectDriveAndMerge(vault);
  return { identity, restored: result.merged && result.evidenceCount > 0 };
}

export function getConnectedDriveAccount(): DriveIdentity | null {
  return loadDriveIdentity();
}

export { connectDriveAndMerge, googleProfileId, setActiveProfileId };
