import type {
  EvidenceAppendInput,
  SearchHit,
  VaultDocument,
  VaultStatus,
} from "./types";

/** Hexagonal port: vault lifecycle + Evidence CRUD + rebuildable search. */
export interface VaultPort {
  open(rootLabel?: string): Promise<VaultStatus>;
  status(): Promise<VaultStatus>;
  appendEvidence(input: EvidenceAppendInput): Promise<VaultDocument>;
  listEvidence(): Promise<VaultDocument[]>;
  getById(id: string): Promise<VaultDocument | null>;
  rebuildIndex(): Promise<{ indexed: number }>;
  search(query: string): Promise<SearchHit[]>;
}
