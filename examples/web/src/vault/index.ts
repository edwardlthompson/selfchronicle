export type { VaultPort } from "./ports";
export { MemoryVault } from "./memoryVault";
export { ProfileVault } from "./profileVault";
export type { ProfileVaultOptions } from "./profileVault";
export { newVaultId, isVaultId } from "./ids";
export { getActiveProfileId, setActiveProfileId, googleProfileId, LOCAL_PROFILE_ID } from "./persist/profileKey";
export type { VaultSnapshot } from "./persist/types";
export { MemoryVaultStore } from "./persist/store";
export { parseFrontmatter, coerceFrontmatter } from "./frontmatter";
export { serializeDocument } from "./serialize";
export type {
  EvidenceAppendInput,
  VaultDocument,
  VaultStatus,
  VaultFrontmatter,
  SearchHit,
} from "./types";
export { VAULT_PATHS, VAULT_SCHEMA_VERSION } from "./types";

