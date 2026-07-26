import { beforeEach, describe, expect, it } from "vitest";
import {
  assertCiphertextTarget,
  loadTarget,
  saveTarget,
} from "./target";

describe("webdav age-pack target", () => {
  beforeEach(() => localStorage.clear());

  it("forces ciphertext true on save/load", () => {
    saveTarget({
      url: "https://dav.example/remote.php/dav",
      username: "me",
      pathPrefix: "/packs",
      enabled: true,
      ciphertext: false as unknown as true,
    });
    const t = loadTarget();
    expect(t.ciphertext).toBe(true);
    expect(t.enabled).toBe(true);
    expect(() => assertCiphertextTarget(t)).not.toThrow();
  });
});
