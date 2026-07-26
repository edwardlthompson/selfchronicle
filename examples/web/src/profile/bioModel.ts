import type { ProfileIdentity } from "./identityModel";
import { emptyIdentity, parseStoredIdentity, serializeIdentity } from "./identityModel";

export const BIO_LAYER_PATH = "profile/bio.json";
export const BIO_SCHEMA_VERSION = 1;

export type BioFieldKey = keyof Omit<ProfileIdentity, "user_edited" | "updated_at">;

export type BioInference = {
  field: BioFieldKey;
  value: string | number | string[];
  source: string;
  confidence: number;
};

export type ProfileBio = ProfileIdentity & {
  schema_version: number;
  edited_fields: BioFieldKey[];
  distilled_at: string | null;
  sources: string[];
  inferences: BioInference[];
};

export function emptyBio(): ProfileBio {
  return {
    ...emptyIdentity(),
    schema_version: BIO_SCHEMA_VERSION,
    edited_fields: [],
    distilled_at: null,
    sources: [],
    inferences: [],
  };
}

export function bioToIdentity(bio: ProfileBio): ProfileIdentity & { learnedFrom?: string[] } {
  const { schema_version: _v, edited_fields: _e, distilled_at: _d, sources, inferences: _i, ...identity } =
    bio;
  return {
    ...identity,
    learnedFrom: sources.length ? sources : undefined,
  };
}

export function parseStoredBio(raw: string): ProfileBio | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ProfileBio>;
    return {
      ...emptyBio(),
      ...parsed,
      links: parsed.links ?? [],
      occupations: parsed.occupations ?? [],
      languages: parsed.languages ?? [],
      bioBlurb: parsed.bioBlurb ?? "",
      edited_fields: parsed.edited_fields ?? [],
      sources: parsed.sources ?? [],
      inferences: parsed.inferences ?? [],
    };
  } catch {
    return null;
  }
}

export function serializeBio(bio: ProfileBio): string {
  return JSON.stringify(bio);
}

/** Migrate legacy profile/identity.json into bio shape. */
export function bioFromLegacyIdentity(raw: string): ProfileBio | null {
  const identity = parseStoredIdentity(raw);
  if (!identity) return null;
  const edited: BioFieldKey[] = identity.user_edited
    ? ([
        "displayName",
        "preferredName",
        "dateOfBirth",
        "age",
        "homeAddress",
        "email",
        "phone",
        "links",
        "occupations",
        "languages",
        "bioBlurb",
      ] as BioFieldKey[])
    : [];
  return {
    ...identity,
    schema_version: BIO_SCHEMA_VERSION,
    edited_fields: edited,
    distilled_at: null,
    sources: [],
    inferences: [],
  };
}

export function syncIdentityLayer(bio: ProfileBio): string {
  const identity: ProfileIdentity = {
    displayName: bio.displayName,
    preferredName: bio.preferredName,
    dateOfBirth: bio.dateOfBirth,
    age: bio.age,
    homeAddress: bio.homeAddress,
    email: bio.email,
    phone: bio.phone,
    links: bio.links,
    occupations: bio.occupations,
    languages: bio.languages,
    bioBlurb: bio.bioBlurb,
    user_edited: bio.user_edited || bio.edited_fields.length > 0,
    updated_at: bio.updated_at,
  };
  return serializeIdentity(identity);
}
