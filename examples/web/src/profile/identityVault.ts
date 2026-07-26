import type { ProfileVault } from "../vault/profileVault";
import {
  IDENTITY_LAYER_PATH,
  parseStoredIdentity,
  serializeIdentity,
  type ProfileIdentity,
} from "./identityModel";

export async function getStoredIdentity(vault: ProfileVault): Promise<ProfileIdentity | null> {
  const raw = vault.readLayer(IDENTITY_LAYER_PATH);
  if (!raw) return null;
  return parseStoredIdentity(raw);
}

export async function saveIdentity(
  vault: ProfileVault,
  identity: ProfileIdentity,
): Promise<void> {
  const payload: ProfileIdentity = {
    ...identity,
    user_edited: true,
    updated_at: new Date().toISOString(),
  };
  await vault.writeLayer(IDENTITY_LAYER_PATH, serializeIdentity(payload));
}
