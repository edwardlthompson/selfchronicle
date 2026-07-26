import type { ProfileVault, VaultDocument } from "../vault";

export type DistillCandidate = {
  id: string;
  proposedTitle: string;
  proposedBody: string;
  evidenceId: string;
  status: "pending" | "accepted" | "rejected";
  provisional: true;
};

/** Extract simple Fact candidates from Evidence (user must review). */
export function proposeFromEvidence(doc: VaultDocument): DistillCandidate | null {
  const body = doc.body.trim();
  if (body.length < 20) return null;
  const line = body.split(/\n/).find((l) => l.trim().length > 12) ?? body.slice(0, 120);
  return {
    id: `distill_${doc.frontmatter.id}`,
    proposedTitle: line.replace(/^#+\s*/, "").slice(0, 80),
    proposedBody: `From evidence ${doc.frontmatter.id}:\n\n${line.trim()}`,
    evidenceId: doc.frontmatter.id,
    status: "pending",
    provisional: true,
  };
}

export async function buildReviewQueue(vault: ProfileVault): Promise<DistillCandidate[]> {
  const evidence = await vault.listEvidence();
  return evidence
    .map(proposeFromEvidence)
    .filter((c): c is DistillCandidate => c != null)
    .slice(0, 20);
}

export async function acceptCandidate(
  vault: ProfileVault,
  c: DistillCandidate,
): Promise<VaultDocument> {
  return vault.upsertLayer("facts", c.proposedTitle, c.proposedBody, [c.evidenceId]);
}
