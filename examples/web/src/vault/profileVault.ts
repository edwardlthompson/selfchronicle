import { buildLayerDoc, parseLayerFile, type LayerKind } from "./layers";
import { MemoryVault } from "./memoryVault";
import { getActiveProfileId } from "./persist/profileKey";
import type { VaultStore } from "./persist/store";
import { createVaultStore } from "./persist/idbStore";
import { notifyVaultPersisted } from "./persist/syncHook";
import { emptySnapshot, type VaultSnapshot } from "./persist/types";
import type { VaultPort } from "./ports";
import type { EvidenceAppendInput, SearchHit, VaultDocument, VaultStatus } from "./types";
import { VAULT_PATHS } from "./types";

export type ProfileVaultOptions = {
  inner?: MemoryVault;
  store?: VaultStore;
  profileId?: string;
  persist?: boolean;
};

/** MemoryVault + Facts/Biography layers + On This Day query + optional IndexedDB persist. */
export class ProfileVault implements VaultPort {
  private inner: MemoryVault;
  private layers = new Map<string, string>();
  private store: VaultStore | null;
  private profileId: string;
  private persistEnabled: boolean;

  constructor(opts: ProfileVaultOptions = {}) {
    this.inner = opts.inner ?? new MemoryVault();
    this.store = opts.persist === false ? null : (opts.store ?? createVaultStore());
    this.profileId = opts.profileId ?? getActiveProfileId();
    this.persistEnabled = opts.persist !== false && this.store != null;
  }

  setProfileId(profileId: string): void {
    this.profileId = profileId;
  }

  getProfileId(): string {
    return this.profileId;
  }

  getStore(): VaultStore | null {
    return this.store;
  }

  exportSnapshot(): VaultSnapshot {
    return {
      schema_version: 1,
      files: this.inner.exportFiles(),
      layers: Object.fromEntries(this.layers),
      meta: this.inner.getMeta(),
    };
  }

  importSnapshot(snapshot: VaultSnapshot): void {
    this.inner.importFiles(snapshot.files, snapshot.meta);
    this.layers = new Map(Object.entries(snapshot.layers ?? {}));
  }

  async persistNow(): Promise<void> {
    if (!this.persistEnabled || !this.store) return;
    await this.store.save(this.profileId, this.exportSnapshot());
    notifyVaultPersisted(this);
  }

  private async flush(): Promise<void> {
    await this.persistNow();
  }

  async open(rootLabel?: string): Promise<VaultStatus> {
    if (this.persistEnabled && this.store) {
      const snap = await this.store.load(this.profileId);
      if (snap && Object.keys(snap.files).length > 0) {
        this.importSnapshot(snap);
      }
    }
    const label = rootLabel ?? `idb://${this.profileId}`;
    const status = await this.inner.open(label);
    await this.flush();
    return status;
  }

  async reloadFromStore(): Promise<VaultStatus> {
    if (this.persistEnabled && this.store) {
      const snap = await this.store.load(this.profileId);
      if (snap) this.importSnapshot(snap);
      else this.importSnapshot(emptySnapshot());
    }
    return this.inner.open(`idb://${this.profileId}`);
  }

  status(): Promise<VaultStatus> {
    return this.inner.status();
  }
  async appendEvidence(input: EvidenceAppendInput): Promise<VaultDocument> {
    const doc = await this.inner.appendEvidence(input);
    await this.flush();
    return doc;
  }
  listEvidence(): Promise<VaultDocument[]> {
    return this.inner.listEvidence();
  }
  getById(id: string): Promise<VaultDocument | null> {
    return this.inner.getById(id);
  }
  async rebuildIndex(): Promise<{ indexed: number }> {
    const r = await this.inner.rebuildIndex();
    await this.flush();
    return r;
  }
  search(query: string): Promise<SearchHit[]> {
    return this.inner.search(query);
  }

  async upsertLayer(
    kind: LayerKind,
    title: string,
    body: string,
    evidenceIds: string[] = [],
  ): Promise<VaultDocument> {
    const built = buildLayerDoc(kind, title, body, evidenceIds);
    this.layers.set(built.path, built.markdown);
    await this.flush();
    return built.doc;
  }

  async listLayer(kind: LayerKind): Promise<VaultDocument[]> {
    const prefix = kind === "facts" ? VAULT_PATHS.facts : VAULT_PATHS.biography;
    const out: VaultDocument[] = [];
    for (const [path, md] of this.layers) {
      if (path.startsWith(`${prefix}/`)) out.push(parseLayerFile(path, md));
    }
    return out;
  }

  readLayer(path: string): string | undefined {
    return this.layers.get(path);
  }

  async writeLayer(path: string, content: string): Promise<void> {
    this.layers.set(path, content);
    await this.flush();
  }
}
