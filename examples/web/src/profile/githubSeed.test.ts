import { describe, expect, it, vi } from "vitest";
import { seedFromGithubFixture } from "./githubSeed";
import type { ProfileVault } from "../vault";

function emptyVault(): ProfileVault {
  return {
    listEvidence: vi.fn(async () => []),
    appendEvidence: vi.fn(),
    upsertLayer: vi.fn(),
  } as unknown as ProfileVault;
}

describe("seedFromGithubFixture", () => {
  it("does not inject personal data into an empty vault", async () => {
    const vault = emptyVault();
    await expect(seedFromGithubFixture(vault)).resolves.toBe(false);
    expect(vault.appendEvidence).not.toHaveBeenCalled();
  });

  it("returns false when evidence already exists", async () => {
    const vault = emptyVault();
    vi.mocked(vault.listEvidence).mockResolvedValue([{ path: "x.md" } as never]);
    await expect(seedFromGithubFixture(vault)).resolves.toBe(false);
  });
});
