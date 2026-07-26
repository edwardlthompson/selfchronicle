import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryVaultStore } from "../../vault/persist/store";
import { ProfileVault } from "../../vault/profileVault";
import { mergeSnapshots } from "../../vault/persist/mergeSnapshots";
import { googleProfileId, LOCAL_PROFILE_ID, setActiveProfileId } from "../../vault/persist/profileKey";
import { emptySnapshot } from "../../vault/persist/types";
import { reconcileVaultWithStore, finalizeReconcile } from "./reconcileCore";
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

vi.mock("./config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./config")>();
  return { ...actual, isDriveConfigured: vi.fn(() => true) };
});

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("reconcileVault", () => {
  beforeEach(() => {
    localStorage.clear();
    clearDriveIdentity();
    mockFetch.mockReset();
    setActiveProfileId(LOCAL_PROFILE_ID);
    saveDriveIdentity({
      provider: "google",
      sub: "user123",
      email: "test@example.com",
      connectedAt: new Date().toISOString(),
    });
  });

  it("merges local pre-sign-in profile with google namespace", async () => {
    const store = new MemoryVaultStore();
    const md = (title: string) =>
      `---\nid: sc_ev_x\ntype: evidence\ntitle: ${title}\ncreated_at: 2026-01-01T00:00:00Z\nupdated_at: 2026-01-02T00:00:00Z\ningested_at: 2026-01-01T00:00:00Z\ntags: []\nstatus: active\nuser_edited: true\nprovenance:\n  source: grok_export\nlinks:\n  evidence: []\n  facts: []\n  attachments: []\n---\n\nbody`;

    await store.save(LOCAL_PROFILE_ID, {
      ...emptySnapshot(),
      files: { "evidence/grok.md": md("Grok chat") },
    });

    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("/files?q=")) {
        return new Response(JSON.stringify({ files: [] }), { status: 200 });
      }
      if (url.includes("uploadType=multipart") || url.includes("uploadType=media")) {
        return new Response(JSON.stringify({ id: "file1" }), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 200 });
    });

    const vault = new ProfileVault({ store, profileId: LOCAL_PROFILE_ID });
    setActiveProfileId(googleProfileId("user123"));
    vault.setProfileId(googleProfileId("user123"));
    const { pushed } = await reconcileVaultWithStore(
      vault,
      store,
      googleProfileId("user123"),
      "mock-token",
    );
    const result = await finalizeReconcile(vault, true, pushed);
    expect(result.merged).toBe(true);
    const listed = await vault.listEvidence();
    expect(listed.some((d) => d.frontmatter.title === "Grok chat")).toBe(true);
    expect(vault.getProfileId()).toBe(googleProfileId("user123"));
  });

  it("union merges drive and local without dropping sources", () => {
    const md = (id: string, title: string, src: string) =>
      `---\nid: ${id}\ntype: evidence\ntitle: ${title}\ncreated_at: 2026-01-01T00:00:00Z\nupdated_at: 2026-01-05T00:00:00Z\ningested_at: 2026-01-01T00:00:00Z\ntags: []\nstatus: active\nuser_edited: true\nprovenance:\n  source: ${src}\nlinks:\n  evidence: []\n  facts: []\n  attachments: []\n---\n\nbody`;

    const local = {
      ...emptySnapshot(),
      files: { "evidence/a.md": md("sc_ev_a", "Grok", "grok_export") },
    };
    const remote = {
      ...emptySnapshot(),
      files: { "evidence/b.md": md("sc_ev_b", "ChatGPT", "chatgpt_export") },
    };
    const merged = mergeSnapshots(local, remote);
    expect(Object.keys(merged.files)).toHaveLength(2);
  });
});
