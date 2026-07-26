/** Vault health: orphans, duplicates, broken provenance refs. */

export type VaultHealthInput = {
  docIds: string[];
  evidenceIds: string[];
  /** Fact/biography ids that reference evidence ids. */
  provenanceLinks: { docId: string; evidenceIds: string[] }[];
};

export type VaultHealthReport = {
  orphans: string[];
  duplicates: string[];
  brokenProvenance: { docId: string; missingEvidenceIds: string[] }[];
  ok: boolean;
};

export function buildHealthReport(input: VaultHealthInput): VaultHealthReport {
  const seen = new Map<string, number>();
  for (const id of input.docIds) {
    seen.set(id, (seen.get(id) ?? 0) + 1);
  }
  const duplicates = [...seen.entries()]
    .filter(([, n]) => n > 1)
    .map(([id]) => id)
    .sort();

  const evidenceSet = new Set(input.evidenceIds);
  const linkedEvidence = new Set<string>();
  const brokenProvenance: VaultHealthReport["brokenProvenance"] = [];

  for (const link of input.provenanceLinks) {
    const missing = link.evidenceIds.filter((e) => !evidenceSet.has(e));
    for (const e of link.evidenceIds) linkedEvidence.add(e);
    if (missing.length) {
      brokenProvenance.push({ docId: link.docId, missingEvidenceIds: missing });
    }
  }

  const orphans = input.evidenceIds
    .filter((e) => !linkedEvidence.has(e))
    .sort();

  return {
    orphans,
    duplicates,
    brokenProvenance,
    ok: duplicates.length === 0 && brokenProvenance.length === 0,
  };
}
