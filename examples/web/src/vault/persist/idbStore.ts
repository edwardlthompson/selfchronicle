import type { VaultStore } from "./store";
import { MemoryVaultStore } from "./store";
import type { VaultSnapshot } from "./types";

const DB_NAME = "selfchronicle-vault";
const DB_VERSION = 1;
const STORE = "profiles";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("idb_open_failed"));
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

function idbGet(db: IDBDatabase, key: string): Promise<VaultSnapshot | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onerror = () => reject(req.error ?? new Error("idb_get_failed"));
    req.onsuccess = () => resolve((req.result as VaultSnapshot | undefined) ?? null);
  });
}

function idbPut(db: IDBDatabase, key: string, value: VaultSnapshot): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("idb_put_failed"));
    tx.objectStore(STORE).put(value, key);
  });
}

function idbDelete(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("idb_delete_failed"));
    tx.objectStore(STORE).delete(key);
  });
}

export class IndexedDbVaultStore implements VaultStore {
  async load(profileId: string): Promise<VaultSnapshot | null> {
    const db = await openDb();
    try {
      return await idbGet(db, profileId);
    } finally {
      db.close();
    }
  }

  async save(profileId: string, snapshot: VaultSnapshot): Promise<void> {
    const db = await openDb();
    try {
      await idbPut(db, profileId, snapshot);
    } finally {
      db.close();
    }
  }

  async delete(profileId: string): Promise<void> {
    const db = await openDb();
    try {
      await idbDelete(db, profileId);
    } finally {
      db.close();
    }
  }
}

export function createVaultStore(): VaultStore {
  if (typeof indexedDB !== "undefined") return new IndexedDbVaultStore();
  return new MemoryVaultStore();
}
