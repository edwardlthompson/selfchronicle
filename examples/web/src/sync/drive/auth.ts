import { GOOGLE_DRIVE_SCOPES, getGoogleClientId } from "./config";
import type { DriveIdentity } from "./identity";
import { saveDriveIdentity } from "./identity";

type TokenClient = {
  requestAccessToken: (opts?: { prompt?: string }) => void;
};

type GisWindow = Window & {
  google?: {
    accounts: {
      oauth2: {
        initTokenClient: (cfg: {
          client_id: string;
          scope: string;
          callback: (resp: { access_token?: string; error?: string }) => void;
        }) => TokenClient;
      };
    };
  };
};

let gisLoaded = false;

function loadGisScript(): Promise<void> {
  if (gisLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      gisLoaded = true;
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => {
      gisLoaded = true;
      resolve();
    };
    s.onerror = () => reject(new Error("google_gis_load_failed"));
    document.head.appendChild(s);
  });
}

export async function requestGoogleAccessToken(prompt?: "consent"): Promise<string> {
  const clientId = getGoogleClientId();
  if (!clientId) throw new Error("google_client_id_missing");
  await loadGisScript();
  const gis = (window as GisWindow).google?.accounts.oauth2;
  if (!gis) throw new Error("google_gis_unavailable");

  return new Promise((resolve, reject) => {
    const client = gis.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_DRIVE_SCOPES,
      callback: (resp) => {
        if (resp.error) reject(new Error(resp.error));
        else if (resp.access_token) resolve(resp.access_token);
        else reject(new Error("google_token_missing"));
      },
    });
    client.requestAccessToken(prompt ? { prompt } : undefined);
  });
}

export async function fetchGoogleUserInfo(token: string): Promise<DriveIdentity> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("google_userinfo_failed");
  const data = (await res.json()) as { sub?: string; email?: string; name?: string };
  if (!data.sub || !data.email) throw new Error("google_userinfo_incomplete");
  const identity: DriveIdentity = {
    provider: "google",
    sub: data.sub,
    email: data.email,
    name: data.name,
    connectedAt: new Date().toISOString(),
  };
  saveDriveIdentity(identity);
  return identity;
}

export async function connectGoogleDrive(): Promise<{ token: string; identity: DriveIdentity }> {
  const token = await requestGoogleAccessToken("consent");
  const identity = await fetchGoogleUserInfo(token);
  return { token, identity };
}

import { clearDriveIdentity } from "./identity";

export function disconnectGoogleDrive(): void {
  clearDriveIdentity();
}
