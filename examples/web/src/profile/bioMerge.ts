import type { DriveIdentity } from "../sync/drive/identity";
import type { VaultMeta } from "../vault/types";
import { computeAgeFromDob } from "./identityAge";
import type { IdentityPatch } from "./identityExtract";
import type { BioFieldKey, ProfileBio } from "./bioModel";
import { emptyBio } from "./bioModel";
import type { DistilledBio } from "./bioDistill";
import { compactProfileBio, filterOccupations, prioritizeLinks } from "./bioCompact";

function isGenericVaultName(name: string | undefined): boolean {
  if (!name) return true;
  return /^selfchronicle\s+vault$/i.test(name.trim());
}

function isFieldEdited(bio: ProfileBio, key: BioFieldKey): boolean {
  return bio.user_edited || bio.edited_fields.includes(key);
}

function pickScalar(
  bio: ProfileBio,
  key: "displayName" | "preferredName" | "dateOfBirth" | "homeAddress" | "email" | "phone" | "bioBlurb",
  extracted: IdentityPatch,
): string {
  const stored = bio[key];
  const ext = extracted[key];
  const fromStored = typeof stored === "string" ? stored.trim() : "";
  const fromExt = typeof ext === "string" ? ext.trim() : "";
  if (isFieldEdited(bio, key) && fromStored) return fromStored;
  if (fromExt) return fromExt;
  return fromStored;
}

function pickList(
  bio: ProfileBio,
  key: "links" | "occupations" | "languages",
  extracted: IdentityPatch,
): string[] {
  const stored = bio[key];
  const ext = extracted[key] ?? [];
  if (isFieldEdited(bio, key) && stored.length) {
    return key === "links" ? prioritizeLinks(stored) : key === "occupations" ? filterOccupations(stored) : stored;
  }
  if (key === "occupations") {
    const merged = filterOccupations([...stored, ...ext]);
    if (merged.length) return merged;
  }
  if (ext.length) return ext;
  return key === "links"
    ? prioritizeLinks(stored)
    : key === "occupations"
      ? filterOccupations(stored)
      : stored;
}

function pickAge(bio: ProfileBio, extracted: IdentityPatch): number | null {
  if (isFieldEdited(bio, "age") && bio.age != null) return bio.age;
  if (extracted.age != null) return extracted.age;
  return bio.age;
}

export function mergeBio(opts: {
  stored: ProfileBio | null;
  distilled: DistilledBio;
  meta: VaultMeta | null;
  drive: DriveIdentity | null;
}): ProfileBio {
  const stored = opts.stored ?? emptyBio();
  const { patch, inferences, sources } = opts.distilled;

  const merged: ProfileBio = compactProfileBio({
    ...emptyBio(),
    displayName: pickScalar(stored, "displayName", patch),
    preferredName: pickScalar(stored, "preferredName", patch),
    dateOfBirth: pickScalar(stored, "dateOfBirth", patch),
    age: pickAge(stored, patch),
    homeAddress: pickScalar(stored, "homeAddress", patch),
    email: pickScalar(stored, "email", patch),
    phone: pickScalar(stored, "phone", patch),
    bioBlurb: pickScalar(stored, "bioBlurb", patch),
    links: pickList(stored, "links", patch),
    occupations: pickList(stored, "occupations", patch),
    languages: pickList(stored, "languages", patch),
    user_edited: stored.user_edited,
    updated_at: stored.updated_at,
    edited_fields: [...stored.edited_fields],
    distilled_at: new Date().toISOString(),
    sources: sources.length ? sources : stored.sources,
    inferences: inferences.length ? inferences : stored.inferences,
  });

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

export function bioChanged(before: ProfileBio | null, after: ProfileBio): boolean {
  if (!before) return true;
  const fields: BioFieldKey[] = [
    "displayName",
    "preferredName",
    "dateOfBirth",
    "age",
    "homeAddress",
    "email",
    "phone",
    "bioBlurb",
    "links",
    "occupations",
    "languages",
  ];
  for (const f of fields) {
    const a = before[f];
    const b = after[f];
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.join("|") !== b.join("|")) return true;
    } else if (a !== b) return true;
  }
  if (before.sources.join("|") !== after.sources.join("|")) return true;
  return false;
}
