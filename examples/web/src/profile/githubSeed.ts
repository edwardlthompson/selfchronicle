import type { ProfileVault } from "../vault";

/**
 * @deprecated Personal fixtures are not shipped in the app.
 * Kept as a no-op so older tests/callers fail closed (empty vault stays empty).
 */
export async function seedFromGithubFixture(vault: ProfileVault): Promise<boolean> {
  const existing = await vault.listEvidence();
  if (existing.length > 0) return false;
  void vault;
  return false;
}
