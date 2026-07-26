import { beforeEach, describe, expect, it } from "vitest";
import { biographyDiff, listVaults, upsertVault } from "./registry";

describe("multi-vault", () => {
  beforeEach(() => localStorage.clear());

  it("registers vaults and diffs biography", () => {
    upsertVault({ id: "v1", name: "Primary", rootUri: "memory://a" });
    expect(listVaults()).toHaveLength(1);
    expect(biographyDiff("a b", "a b c").added).toBe(1);
  });
});
