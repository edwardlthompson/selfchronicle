/** Google Drive account identity — vault namespace follows this account. */

export type DriveIdentity = {
  provider: "google";
  /** Google OAuth subject — stable per account. */
  sub: string;
  email: string;
  name?: string;
  connectedAt: string;
};

const KEY = "sc.drive.identity";

export function loadDriveIdentity(): DriveIdentity | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DriveIdentity>;
    if (parsed.provider !== "google" || !parsed.sub || !parsed.email) return null;
    return {
      provider: "google",
      sub: String(parsed.sub),
      email: String(parsed.email),
      name: parsed.name ? String(parsed.name) : undefined,
      connectedAt: String(parsed.connectedAt ?? new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

export function saveDriveIdentity(identity: DriveIdentity): void {
  localStorage.setItem(KEY, JSON.stringify(identity));
}

export function clearDriveIdentity(): void {
  localStorage.removeItem(KEY);
}

/** Drive file id per profile — avoids repeated folder searches. */
const FILE_KEY = "sc.drive.packFileId";

export function loadDrivePackFileId(profileId: string): string | null {
  try {
    const raw = localStorage.getItem(FILE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[profileId] ?? null;
  } catch {
    return null;
  }
}

export function saveDrivePackFileId(profileId: string, fileId: string): void {
  let map: Record<string, string> = {};
  try {
    map = JSON.parse(localStorage.getItem(FILE_KEY) ?? "{}") as Record<string, string>;
  } catch {
    map = {};
  }
  map[profileId] = fileId;
  localStorage.setItem(FILE_KEY, JSON.stringify(map));
}
