import type { ProfileVault } from "../profileVault";

let afterPersistHook: ((vault: ProfileVault) => void) | null = null;

export function setVaultAfterPersistHook(fn: ((vault: ProfileVault) => void) | null): void {
  afterPersistHook = fn;
}

export function notifyVaultPersisted(vault: ProfileVault): void {
  afterPersistHook?.(vault);
}
