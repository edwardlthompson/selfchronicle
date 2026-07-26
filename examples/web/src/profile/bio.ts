export type { ProfileBio, BioFieldKey, BioInference } from "./bioModel";
export { BIO_LAYER_PATH, bioToIdentity, emptyBio } from "./bioModel";
export { distillBioFromVault, type DistilledBio } from "./bioDistill";
export { mergeBio, bioChanged } from "./bioMerge";
export {
  distillAndPersistBio,
  resolveProfileIdentity,
  scheduleBioDistill,
  saveBioFromForm,
  type ResolvedIdentity,
} from "./bioVault";
