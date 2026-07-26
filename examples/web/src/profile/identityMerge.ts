import type { DriveIdentity } from "../sync/drive/identity";
import type { VaultDocument, VaultMeta } from "../vault/types";
import { computeAgeFromDob } from "./identityAge";
import type { IdentityPatch } from "./identityExtract";
import { extractFromBiography, extractFromFacts } from "./identityExtract";
import { emptyIdentity, type ProfileIdentity } from "./identityModel";

function isGenericVaultName(name: string | undefined): boolean {
  if (!name) return true;
  return /^selfchronicle\s+vault$/i.test(name.trim());
}

export function mergeIdentity(opts: {
  stored: ProfileIdentity | null;
  facts: VaultDocument[];
  chapters: VaultDocument[];
  meta: VaultMeta | null;
  drive: DriveIdentity | null;
}): ProfileIdentity {
  const extracted: IdentityPatch = {
    ...extractFromBiography(opts.chapters),
    ...extractFromFacts(opts.facts),
  };
  const stored = opts.stored ?? emptyIdentity();
  const honor = stored.user_edited;
  const pick = (key: keyof IdentityPatch, fallback = ""): string => {
    const s = stored[key as keyof ProfileIdentity];
    const fromStored = typeof s === "string" ? s : fallback;
    const fromExtracted = extracted[key];
    const ext = typeof fromExtracted === "string" ? fromExtracted : fallback;
    if (honor && fromStored.trim()) return fromStored.trim();
    if (ext.trim()) return ext.trim();
    return fromStored.trim();
  };
  const pickList = (key: "links" | "occupations" | "languages"): string[] => {
    const s = stored[key];
    const e = extracted[key] ?? [];
    if (honor && s.length) return s;
    if (e.length) return e;
    return s;
  };
  const merged: ProfileIdentity = {
    ...emptyIdentity(),
    displayName: pick("displayName"),
    preferredName: pick("preferredName"),
    dateOfBirth: pick("dateOfBirth"),
    age: honor && stored.age != null ? stored.age : (extracted.age ?? stored.age),
    homeAddress: pick("homeAddress"),
    email: pick("email"),
    phone: pick("phone"),
    links: pickList("links"),
    occupations: pickList("occupations"),
    languages: pickList("languages"),
    user_edited: stored.user_edited,
    updated_at: stored.updated_at,
  };
  if (!merged.displayName && opts.drive?.name) merged.displayName = opts.drive.name;
  if (!merged.email && opts.drive?.email) merged.email = opts.drive.email;
  if (!merged.displayName && !isGenericVaultName(opts.meta?.name)) {
    merged.displayName = opts.meta!.name!.trim();
  }
  if (merged.dateOfBirth && merged.age == null) {
    merged.age = computeAgeFromDob(merged.dateOfBirth);
  }
  return merged;
}

export function hasIdentityContent(identity: ProfileIdentity): boolean {
  return Boolean(
    identity.displayName ||
      identity.preferredName ||
      identity.dateOfBirth ||
      identity.age != null ||
      identity.homeAddress ||
      identity.email ||
      identity.phone ||
      identity.bioBlurb ||
      identity.links.length ||
      identity.occupations.length ||
      identity.languages.length,
  );
}
