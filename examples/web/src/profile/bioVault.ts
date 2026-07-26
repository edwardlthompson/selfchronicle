import type { ProfileVault } from "../vault/profileVault";
import { loadDriveIdentity } from "../sync/drive/identity";
import { IDENTITY_LAYER_PATH } from "./identityModel";
import { bioChanged, mergeBio } from "./bioMerge";
import { distillBioFromVault } from "./bioDistill";
import {
  BIO_LAYER_PATH,
  bioFromLegacyIdentity,
  bioToIdentity,
  emptyBio,
  parseStoredBio,
  serializeBio,
  syncIdentityLayer,
  type BioFieldKey,
  type ProfileBio,
} from "./bioModel";
import type { ProfileIdentity } from "./identityModel";

export type ResolvedIdentity = ProfileIdentity & { learnedFrom?: string[] };

let distillTimer: ReturnType<typeof setTimeout> | null = null;

async function loadStoredBio(vault: ProfileVault): Promise<ProfileBio | null> {
  const rawBio = vault.readLayer(BIO_LAYER_PATH);
  if (rawBio) {
    const parsed = parseStoredBio(rawBio);
    if (parsed) return parsed;
  }
  const rawIdentity = vault.readLayer(IDENTITY_LAYER_PATH);
  if (rawIdentity) return bioFromLegacyIdentity(rawIdentity);
  return null;
}

async function persistBio(vault: ProfileVault, bio: ProfileBio): Promise<void> {
  await vault.writeLayer(BIO_LAYER_PATH, serializeBio(bio));
  await vault.writeLayer(IDENTITY_LAYER_PATH, syncIdentityLayer(bio));
}

/** Distill vault knowledge into profile/bio.json; sync identity.json. */
export async function distillAndPersistBio(vault: ProfileVault): Promise<ProfileBio> {
  const [facts, chapters, evidence, status] = await Promise.all([
    vault.listLayer("facts"),
    vault.listLayer("biography"),
    vault.listEvidence(),
    vault.status(),
  ]);
  const stored = await loadStoredBio(vault);
  const distilled = distillBioFromVault({ facts, chapters, evidence });
  const merged = mergeBio({
    stored,
    distilled,
    meta: status.meta,
    drive: loadDriveIdentity(),
  });
  if (bioChanged(stored, merged)) {
    await persistBio(vault, merged);
  }
  return merged;
}

export async function resolveProfileIdentity(vault: ProfileVault): Promise<ResolvedIdentity> {
  const bio = await distillAndPersistBio(vault);
  return bioToIdentity(bio);
}

export function scheduleBioDistill(vault: ProfileVault, delayMs = 400): void {
  if (distillTimer) clearTimeout(distillTimer);
  distillTimer = setTimeout(() => {
    distillTimer = null;
    void distillAndPersistBio(vault);
  }, delayMs);
}

export async function saveBioFromForm(
  vault: ProfileVault,
  identity: ProfileIdentity,
  editedFields?: BioFieldKey[],
): Promise<void> {
  const stored = (await loadStoredBio(vault)) ?? emptyBio();
  const fields =
    editedFields ??
    ([
      "displayName",
      "preferredName",
      "dateOfBirth",
      "homeAddress",
      "email",
      "phone",
      "bioBlurb",
      "links",
      "occupations",
      "languages",
    ] as BioFieldKey[]);
  const bio: ProfileBio = {
    ...stored,
    ...identity,
    user_edited: true,
    updated_at: new Date().toISOString(),
    edited_fields: [...new Set([...stored.edited_fields, ...fields])],
  };
  await persistBio(vault, bio);
}

export { loadStoredBio, persistBio };
