import type { VaultSnapshot } from "./types";

/** Persistence port — IndexedDB in browser, in-memory in tests. */
export interface VaultStore {
  load(profileId: string): Promise<VaultSnapshot | null>;
  save(profileId: string, snapshot: VaultSnapshot): Promise<void>;
  delete(profileId: string): Promise<void>;
}

export class MemoryVaultStore implements VaultStore {
  private data = new Map<string, VaultSnapshot>();

  load(profileId: string): Promise<VaultSnapshot | null> {
    return Promise.resolve(this.data.get(profileId) ?? null);
  }

  save(profileId: string, snapshot: VaultSnapshot): Promise<void> {
    this.data.set(profileId, snapshot);
    return Promise.resolve();
  }

  delete(profileId: string): Promise<void> {
    this.data.delete(profileId);
    return Promise.resolve();
  }
}
