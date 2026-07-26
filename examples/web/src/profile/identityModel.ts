/** User identity surfaced on Profile — never shipped in the app bundle. */
export type ProfileIdentity = {
  displayName: string;
  preferredName: string;
  dateOfBirth: string;
  age: number | null;
  homeAddress: string;
  email: string;
  phone: string;
  links: string[];
  occupations: string[];
  languages: string[];
  /** Optional short bio blurb (≤400 chars); not search/research noise. */
  bioBlurb: string;
  user_edited: boolean;
  updated_at: string | null;
};

export const IDENTITY_LAYER_PATH = "profile/identity.json";

export function emptyIdentity(): ProfileIdentity {
  return {
    displayName: "",
    preferredName: "",
    dateOfBirth: "",
    age: null,
    homeAddress: "",
    email: "",
    phone: "",
    links: [],
    occupations: [],
    languages: [],
    bioBlurb: "",
    user_edited: false,
    updated_at: null,
  };
}

export function parseStoredIdentity(raw: string): ProfileIdentity | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ProfileIdentity>;
    return {
      ...emptyIdentity(),
      ...parsed,
      links: parsed.links ?? [],
      occupations: parsed.occupations ?? [],
      languages: parsed.languages ?? [],
    };
  } catch {
    return null;
  }
}

export function serializeIdentity(identity: ProfileIdentity): string {
  return JSON.stringify(identity);
}
