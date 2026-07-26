import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryVaultStore } from "../../vault/persist/store";
import { ProfileVault } from "../../vault/profileVault";
import { googleProfileId, setActiveProfileId } from "../../vault/persist/profileKey";
import {
  applyDriveEnvelope,
  envelopeFromVault,
  saveVaultToDrive,
  restoreVaultFromDrive,
} from "./vaultSync";
import { saveDriveIdentity, clearDriveIdentity } from "./identity";

vi.mock("./auth", () => ({
  requestGoogleAccessToken: vi.fn(async () => "mock-token"),
  connectGoogleDrive: vi.fn(async () => ({
    token: "mock-token",
    identity: {
      provider: "google" as const,
      sub: "user123",
      email: "test@example.com",
      connectedAt: new Date().toISOString(),
    },
  })),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("Drive vault sync", () => {
  beforeEach(() => {
    localStorage.clear();
    clearDriveIdentity();
    mockFetch.mockReset();
    setActiveProfileId(googleProfileId("user123"));
  });

  it("keys profile id from Google sub", () => {
    expect(googleProfileId("abc")).toBe("google:abc");
  });

  it("envelope round-trips vault snapshot", async () => {
    const store = new MemoryVaultStore();
    const vault = new ProfileVault({ store, profileId: googleProfileId("user123") });
    await vault.open();
    await vault.appendEvidence({ title: "Drive note", body: "sync test" });
    const env = envelopeFromVault(vault);
    expect(env.profile_id).toBe("google:user123");
    expect(env.ciphertext).toBe(false);

    const vault2 = new ProfileVault({ store, profileId: googleProfileId("user123"), persist: false });
    const snap = applyDriveEnvelope(JSON.stringify(env));
    vault2.importSnapshot(snap);
    const listed = await vault2.listEvidence();
    expect(listed[0]?.frontmatter.title).toBe("Drive note");
  });

  it("uploads pack to Drive API", async () => {
    mockFetch.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes("/files?q=") && url.includes("folder")) {
        return new Response(JSON.stringify({ files: [{ id: "folder1" }] }), { status: 200 });
      }
      if (url.includes("uploadType=multipart")) {
        return new Response(JSON.stringify({ id: "file1" }), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 200 });
    });

    const vault = new ProfileVault({ persist: false, profileId: googleProfileId("user123") });
    await vault.open();
    await vault.appendEvidence({ title: "X", body: "Y" });
    saveDriveIdentity({
      provider: "google",
      sub: "user123",
      email: "test@example.com",
      connectedAt: new Date().toISOString(),
    });

    const result = await saveVaultToDrive(vault);
    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalled();
  });

  it("downloads pack from Drive API", async () => {
    const store = new MemoryVaultStore();
    const vault = new ProfileVault({ store, profileId: googleProfileId("user123") });
    await vault.open();
    await vault.appendEvidence({ title: "Local", body: "only" });
    const json = JSON.stringify(envelopeFromVault(vault));

    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("/files?q=")) {
        return new Response(JSON.stringify({ files: [{ id: "folder1" }] }), { status: 200 });
      }
      if (url.includes("alt=media")) {
        return new Response(json, { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 200 });
    });

    localStorage.setItem("sc.drive.packFileId", JSON.stringify({ "google:user123": "file1" }));
    const result = await restoreVaultFromDrive(vault);
    expect(result.ok).toBe(true);
    const listed = await vault.listEvidence();
    expect(listed.some((d) => d.frontmatter.title === "Local")).toBe(true);
  });
});
