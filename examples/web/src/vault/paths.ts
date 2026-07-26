import { VAULT_PATHS } from "./types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function evidencePath(id: string, when: Date): string {
  return `${VAULT_PATHS.evidence}/${when.getUTCFullYear()}/${pad(when.getUTCMonth() + 1)}/${pad(when.getUTCDate())}/${id}.md`;
}
