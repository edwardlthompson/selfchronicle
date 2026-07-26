import type { ProfileIdentity } from "./identityModel";

export type IdentityPatch = Partial<
  Pick<
    ProfileIdentity,
    | "displayName"
    | "preferredName"
    | "dateOfBirth"
    | "age"
    | "homeAddress"
    | "email"
    | "phone"
    | "links"
    | "occupations"
    | "languages"
    | "bioBlurb"
  >
>;
