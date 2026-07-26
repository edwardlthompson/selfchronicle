import { describe, expect, it, vi } from "vitest";
import { bindProfileSeeds, refreshVaultState } from "./vaultUi";
import type { AppShellState } from "../AppShell";

describe("vaultUi", () => {
  it("refreshVaultState builds profile html", async () => {
    const vault = {
      status: vi.fn(async () => ({
        open: true,
        rootLabel: "m",
        meta: null,
        evidenceCount: 0,
        indexReady: true,
      })),
      listEvidence: vi.fn(async () => []),
      listLayer: vi.fn(async () => []),
      listAllDocs: vi.fn(async () => []),
      onThisDay: vi.fn(async () => []),
      readLayer: vi.fn(() => undefined),
      writeLayer: vi.fn(async () => {}),
    };
    const state = {
      today: { vault: null, recent: [], noteDraft: "", message: "" },
      profileHtml: "",
    } as AppShellState;
    const next = await refreshVaultState(vault as never, state);
    expect(next.profileHtml).toContain("profile-home");
    expect(next.profileHtml).toContain("profile-identity");
  });

  it("bindProfileSeeds wires buttons", () => {
    const root = document.createElement("div");
    root.innerHTML =
      `<button data-profile-seed-bio></button><button data-profile-seed-fact></button>`;
    const upsertLayer = vi.fn(async () => ({}));
    const onDone = vi.fn();
    bindProfileSeeds(root, { upsertLayer } as never, onDone);
    root.querySelector<HTMLButtonElement>("[data-profile-seed-bio]")?.click();
    root.querySelector<HTMLButtonElement>("[data-profile-seed-fact]")?.click();
    expect(upsertLayer).toHaveBeenCalledTimes(2);
  });

  it("bindProfileIdentity toggles form and saves on submit", async () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <button data-profile-identity-edit></button>
      <button data-profile-identity-cancel></button>
      <details data-profile-identity-form hidden>
        <form data-profile-identity-form-el>
          <input name="displayName" value="Ada" />
        </form>
      </details>`;
    const writeLayer = vi.fn(async () => undefined);
    const readLayer = vi.fn(() => undefined);
    const onDone = vi.fn();
    bindProfileSeeds(root, { readLayer, writeLayer, listLayer: vi.fn(async () => []) } as never, onDone);
    const formWrap = root.querySelector<HTMLDetailsElement>("[data-profile-identity-form]");
    expect(formWrap?.hidden).toBe(true);
    root.querySelector<HTMLButtonElement>("[data-profile-identity-edit]")?.click();
    expect(formWrap?.hidden).toBe(false);
    root.querySelector<HTMLButtonElement>("[data-profile-identity-cancel]")?.click();
    expect(formWrap?.hidden).toBe(true);
    root.querySelector<HTMLButtonElement>("[data-profile-identity-edit]")?.click();
    root.querySelector<HTMLFormElement>("[data-profile-identity-form-el]")?.requestSubmit();
    await vi.waitFor(() => expect(writeLayer).toHaveBeenCalled());
    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
  });
});
