import type { ProfileVault } from "../../vault";
import { createVaultStore } from "../../vault/persist/idbStore";
import type { VaultStore } from "../../vault/persist/store";

export function resolveStore(vault: ProfileVault): VaultStore {
  return vault.getStore() ?? createVaultStore();
}
