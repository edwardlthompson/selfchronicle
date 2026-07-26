/** Stable SelfChronicle ids: sc_<type>_<ulid-like>. */

const TYPE_PREFIX: Record<string, string> = {
  evidence: "ev",
  fact: "fa",
  insight: "in",
  biography_chapter: "bi",
  curiosity: "cu",
  wellbeing: "we",
  personality: "pe",
  vault: "va",
  job: "job",
};

function randomPart(len: number): string {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[bytes[i]! % alphabet.length];
  return out;
}

export function newVaultId(kind: keyof typeof TYPE_PREFIX | string): string {
  const prefix = TYPE_PREFIX[kind] ?? "xx";
  const ts = Date.now().toString(36);
  return `sc_${prefix}_${ts}${randomPart(10)}`;
}

export function isVaultId(value: string): boolean {
  return /^sc_[a-z]+_[a-z0-9]+$/i.test(value);
}
