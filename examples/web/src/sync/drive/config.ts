/** Google OAuth client id from env — never commit secrets. See .env.example. */

export const GOOGLE_DRIVE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.file",
].join(" ");

export function getGoogleClientId(): string {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return typeof id === "string" ? id.trim() : "";
}

export function isDriveConfigured(): boolean {
  return getGoogleClientId().length > 0;
}

export const DRIVE_APP_FOLDER = "SelfChronicle";
export const DRIVE_PACK_FILENAME = "vault-pack.json";

/** TODO(crypto): replace cleartext pack with age-encrypted blob before cloud sync. */
export const DRIVE_PACK_CLEARTEXT = true as const;
