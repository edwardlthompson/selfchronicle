export type { ProfileIdentity } from "./identityModel";
export { emptyIdentity, IDENTITY_LAYER_PATH, parseStoredIdentity, serializeIdentity } from "./identityModel";
export { computeAgeFromDob, formatAgeLabel } from "./identityAge";
export {
  extractFromBiography,
  extractFromEvidence,
  extractFromFacts,
  type IdentityPatch,
} from "./identityExtract";
export { hasIdentityContent, mergeIdentity } from "./identityMerge";
export { getStoredIdentity, saveIdentity } from "./identityVault";
export {
  BIO_LAYER_PATH,
  distillAndPersistBio,
  resolveProfileIdentity,
  type ResolvedIdentity,
} from "./bio";
