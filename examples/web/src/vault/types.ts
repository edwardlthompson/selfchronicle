/** Shared vault schema locked from docs/DATA_MODEL.md (Sprint 1). */

export type VaultItemType =
  | "evidence"
  | "fact"
  | "insight"
  | "biography_chapter"
  | "curiosity"
  | "wellbeing"
  | "personality";

export type ItemStatus = "active" | "archived" | "deleted_tombstone";

export type ProvenanceSource =
  | "manual"
  | "manual_paste"
  | "share_target"
  | "day_close"
  | "mcp"
  | "grok_export"
  | "chatgpt_export"
  | "claude_export"
  | "gemini_export"
  | "gmail_takeout"
  | "mbox"
  | "whatsapp_export"
  | "meta_dyi"
  | "facebook_export"
  | "instagram_export"
  | "other_archive";

export type EvidenceChannel =
  | "llm_chat"
  | "email"
  | "messaging"
  | "social"
  | "code"
  | "journal"
  | "other";

export type Provenance = {
  source: ProvenanceSource;
  source_id?: string;
  import_job_id?: string;
  transformer?: string;
  confidence?: number;
};

export type ItemLinks = {
  evidence: string[];
  facts: string[];
  attachments: string[];
};

export type VaultFrontmatter = {
  id: string;
  type: VaultItemType;
  title: string;
  created_at: string;
  updated_at: string;
  ingested_at: string;
  tags: string[];
  status: ItemStatus;
  user_edited: boolean;
  provenance: Provenance;
  links: ItemLinks;
};

export type EvidenceFrontmatter = VaultFrontmatter & {
  type: "evidence";
  occurred_at?: string;
  channel?: EvidenceChannel;
  participants?: string[];
};

export type VaultDocument = {
  frontmatter: VaultFrontmatter;
  body: string;
  /** Relative path under vault root, e.g. evidence/2026/07/26/sc_ev_….md */
  path: string;
};

export type VaultMeta = {
  id: string;
  schema_version: number;
  created_at: string;
  name?: string;
};

export type VaultStatus = {
  open: boolean;
  rootLabel: string;
  meta: VaultMeta | null;
  evidenceCount: number;
  indexReady: boolean;
};

export type EvidenceAppendInput = {
  title: string;
  body: string;
  tags?: string[];
  source?: ProvenanceSource;
  channel?: EvidenceChannel;
  occurred_at?: string;
};

export type SearchHit = {
  id: string;
  path: string;
  title: string;
  type: VaultItemType;
  snippet: string;
};

export const VAULT_PATHS = {
  meta: "meta.yaml",
  evidence: "evidence",
  facts: "facts",
  biography: "biography",
  curiosity: "curiosity",
  wellbeing: "wellbeing",
  personality: "personality",
  insights: "insights",
  imports: "imports",
  audit: "audit",
  index: "_index",
} as const;

export const VAULT_SCHEMA_VERSION = 1;
