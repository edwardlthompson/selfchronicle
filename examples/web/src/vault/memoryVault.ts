import { serializeDocument } from "./frontmatter";
import { newVaultId } from "./ids";
import { buildIndexFromFiles, listEvidenceDocs } from "./memoryVaultIndex";
import { exportVaultFiles, importVaultFiles, readVaultMeta } from "./memoryVaultSnapshot";
import { evidencePath } from "./paths";
import type { VaultPort } from "./ports";
import type { EvidenceAppendInput, SearchHit, VaultDocument, VaultMeta, VaultStatus } from "./types";
import { VAULT_PATHS, VAULT_SCHEMA_VERSION } from "./types";

/** In-memory vault adapter (tests + offline demo until OPFS adapter lands). */
export class MemoryVault implements VaultPort {
  private files = new Map<string, string>();
  private index: ReturnType<typeof buildIndexFromFiles> = [];
  private meta: VaultMeta | null = null;
  private rootLabel = "memory://vault";
  private isOpen = false;

  async open(rootLabel = "memory://vault"): Promise<VaultStatus> {
    this.rootLabel = rootLabel;
    this.isOpen = true;
    if (!this.meta) {
      this.meta = {
        id: newVaultId("vault"),
        schema_version: VAULT_SCHEMA_VERSION,
        created_at: new Date().toISOString(),
        name: "SelfChronicle vault",
      };
      this.files.set(
        VAULT_PATHS.meta,
        [
          "---",
          `id: ${this.meta.id}`,
          `schema_version: ${this.meta.schema_version}`,
          `created_at: ${this.meta.created_at}`,
          `name: ${this.meta.name}`,
          "---",
          "",
        ].join("\n"),
      );
    }
    await this.rebuildIndex();
    return this.status();
  }

  async status(): Promise<VaultStatus> {
    const evidence = [...this.files.keys()].filter((p) =>
      p.startsWith(`${VAULT_PATHS.evidence}/`),
    );
    return {
      open: this.isOpen,
      rootLabel: this.rootLabel,
      meta: this.meta,
      evidenceCount: evidence.length,
      indexReady: this.isOpen,
    };
  }

  async appendEvidence(input: EvidenceAppendInput): Promise<VaultDocument> {
    if (!this.isOpen) await this.open();
    const now = new Date();
    const iso = now.toISOString();
    const id = newVaultId("evidence");
    const path = evidencePath(id, now);
    const fm = {
      id,
      type: "evidence" as const,
      title: input.title,
      created_at: iso,
      updated_at: iso,
      ingested_at: iso,
      tags: input.tags ?? [],
      status: "active" as const,
      user_edited: true,
      provenance: { source: input.source ?? "manual" },
      links: { evidence: [], facts: [], attachments: [] },
    };
    const markdown = serializeDocument(fm, input.body);
    this.files.set(path, markdown);
    await this.rebuildIndex();
    return { frontmatter: fm, body: input.body, path };
  }

  async listEvidence(): Promise<VaultDocument[]> {
    return listEvidenceDocs(this.files);
  }

  async getById(id: string): Promise<VaultDocument | null> {
    return (await this.listEvidence()).find((d) => d.frontmatter.id === id) ?? null;
  }

  async rebuildIndex(): Promise<{ indexed: number }> {
    this.index = buildIndexFromFiles(this.files);
    return { indexed: this.index.length };
  }

  async search(query: string): Promise<SearchHit[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    if (this.index.length === 0) await this.rebuildIndex();
    return this.index
      .filter((row) => row.text.includes(q) || row.title.toLowerCase().includes(q))
      .slice(0, 50)
      .map((row) => ({
        id: row.id,
        path: row.path,
        title: row.title,
        type: row.type,
        snippet: row.text.slice(0, 160),
      }));
  }

  exportFiles(): Record<string, string> {
    return exportVaultFiles({ files: this.files, meta: this.meta });
  }

  importFiles(files: Record<string, string>, meta?: VaultMeta | null): void {
    importVaultFiles({ files: this.files, meta: this.meta }, files, meta);
  }

  getMeta(): VaultMeta | null {
    return readVaultMeta({ files: this.files, meta: this.meta });
  }
}
