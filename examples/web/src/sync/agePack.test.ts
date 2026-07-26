import { describe, expect, it } from "vitest";
import { assertCiphertextOnly, buildAgePackStub } from "./agePack";

describe("age pack stub", () => {
  it("marks ciphertext-only", () => {
    const pack = buildAgePackStub("vault-root");
    expect(pack.ciphertext).toBe(true);
    expect(() => assertCiphertextOnly(pack)).not.toThrow();
  });
});
