import { monthDayKey } from "./layers";
import type { ProfileVault } from "./profileVault";
import type { VaultDocument } from "./types";

export async function vaultListAllDocs(vault: ProfileVault): Promise<VaultDocument[]> {
  const ev = await vault.listEvidence();
  const facts = await vault.listLayer("facts");
  const bio = await vault.listLayer("biography");
  return [...ev, ...facts, ...bio];
}

export async function vaultOnThisDay(vault: ProfileVault, now = new Date()): Promise<VaultDocument[]> {
  const key = monthDayKey(now.toISOString());
  const ev = await vault.listEvidence();
  return ev.filter((d) => monthDayKey(d.frontmatter.created_at) === key);
}
