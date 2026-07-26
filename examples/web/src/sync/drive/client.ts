import { DRIVE_APP_FOLDER, DRIVE_PACK_FILENAME } from "./config";
import { loadDrivePackFileId, saveDrivePackFileId } from "./identity";

type DriveFile = { id: string; name: string };

async function driveFetch(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(`https://www.googleapis.com/drive/v3${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`drive_api_${res.status}`);
  return res;
}

async function findFolder(token: string): Promise<string | null> {
  const q = encodeURIComponent(
    `name='${DRIVE_APP_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  );
  const res = await driveFetch(token, `/files?q=${q}&fields=files(id,name)&spaces=drive`);
  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files?.[0]?.id ?? null;
}

async function createFolder(token: string): Promise<string> {
  const res = await driveFetch(token, "/files?fields=id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: DRIVE_APP_FOLDER,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });
  const data = (await res.json()) as { id: string };
  return data.id;
}

async function ensureFolder(token: string): Promise<string> {
  return (await findFolder(token)) ?? (await createFolder(token));
}

async function findPackFile(token: string, folderId: string): Promise<string | null> {
  const q = encodeURIComponent(
    `name='${DRIVE_PACK_FILENAME}' and '${folderId}' in parents and trashed=false`,
  );
  const res = await driveFetch(token, `/files?q=${q}&fields=files(id)&spaces=drive`);
  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files?.[0]?.id ?? null;
}

export async function uploadDrivePack(
  token: string,
  profileId: string,
  jsonBody: string,
): Promise<string> {
  const folderId = await ensureFolder(token);
  let fileId = loadDrivePackFileId(profileId) ?? (await findPackFile(token, folderId));
  const metadata = { name: DRIVE_PACK_FILENAME, mimeType: "application/json" };
  const boundary = "selfchronicle_boundary";

  if (fileId) {
    await driveFetch(token, `/files/${fileId}?uploadType=media`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: jsonBody,
    });
  } else {
    const body = [
      `--${boundary}`,
      "Content-Type: application/json; charset=UTF-8",
      "",
      JSON.stringify({ ...metadata, parents: [folderId] }),
      `--${boundary}`,
      "Content-Type: application/json",
      "",
      jsonBody,
      `--${boundary}--`,
    ].join("\r\n");
    const res = await driveFetch(
      token,
      "/files?uploadType=multipart&fields=id",
      {
        method: "POST",
        headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
        body,
      },
    );
    const data = (await res.json()) as { id: string };
    fileId = data.id;
  }
  saveDrivePackFileId(profileId, fileId);
  return fileId;
}

export async function downloadDrivePack(token: string, profileId: string): Promise<string | null> {
  const folderId = await findFolder(token);
  if (!folderId) return null;
  const fileId = loadDrivePackFileId(profileId) ?? (await findPackFile(token, folderId));
  if (!fileId) return null;
  const res = await driveFetch(token, `/files/${fileId}?alt=media`);
  return res.text();
}

export function drivePackPath(profileId: string): string {
  return `${DRIVE_APP_FOLDER}/${DRIVE_PACK_FILENAME} (profile: ${profileId})`;
}
