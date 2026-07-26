/** Ciphertext-only sync pack placeholder (age format later). */

export type AgePackMeta = {
  version: 1;
  ciphertext: true;
  note: string;
};

export function buildAgePackStub(payloadLabel: string): AgePackMeta & { blob: string } {
  // Real age encryption lands with native/wasm binding; stub never stores plaintext label in blob.
  return {
    version: 1,
    ciphertext: true,
    note: "Ciphertext-only sync — no plaintext host",
    blob: `age-stub:${btoa(unescape(encodeURIComponent(payloadLabel))).slice(0, 32)}`,
  };
}

export function assertCiphertextOnly(pack: AgePackMeta): void {
  if (!pack.ciphertext) throw new Error("plaintext sync forbidden");
}
