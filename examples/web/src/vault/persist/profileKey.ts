/** Active vault namespace — local default or Google account sub. */

export const LOCAL_PROFILE_ID = "local:default";
const KEY = "sc.vault.activeProfileId";

export function getActiveProfileId(): string {
  try {
    return localStorage.getItem(KEY) ?? LOCAL_PROFILE_ID;
  } catch {
    return LOCAL_PROFILE_ID;
  }
}

export function setActiveProfileId(profileId: string): void {
  localStorage.setItem(KEY, profileId);
}

/** Stable profile key from Google OAuth subject (Drive account identity). */
export function googleProfileId(sub: string): string {
  return `google:${sub}`;
}
