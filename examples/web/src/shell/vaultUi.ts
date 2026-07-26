import type { AppShellState } from "../AppShell";
import { identityFromForm } from "../components/profile/IdentityHeader";
import { resolveProfileIdentity, saveBioFromForm } from "../profile/bio";
import { searchVault } from "../search/fts";
import type { ProfileVault } from "../vault";
import { vaultListAllDocs, vaultOnThisDay } from "../vault/profileVaultQueries";
import { renderProfileView } from "./ProfileView";

export async function refreshVaultState(
  vault: ProfileVault,
  state: AppShellState,
): Promise<AppShellState> {
  const status = await vault.status();
  const recent = await vault.listEvidence();
  const [facts, chapters, audit, onThisDay] = await Promise.all([
    vault.listLayer("facts"),
    vault.listLayer("biography"),
    vaultListAllDocs(vault),
    vaultOnThisDay(vault),
  ]);
  const searchQuery = state.searchQuery ?? "";
  const searchHits = await searchVault(vault, searchQuery);
  const identity = await resolveProfileIdentity(vault);
  return {
    ...state,
    today: { ...state.today, vault: status, recent, message: state.today.message },
    profileHtml: renderProfileView({
      identity,
      facts,
      chapters,
      audit,
      onThisDay,
      searchQuery,
      searchHits,
    }),
  };
}

function toggleIdentityForm(root: HTMLElement, open: boolean): void {
  const wrap = root.querySelector<HTMLDetailsElement>("[data-profile-identity-form]");
  if (!wrap) return;
  wrap.hidden = !open;
  if (open) wrap.open = true;
}

export function bindProfileIdentity(
  root: HTMLElement,
  vault: ProfileVault,
  onDone: () => void,
): void {
  root.querySelector("[data-profile-identity-edit]")?.addEventListener("click", () => {
    toggleIdentityForm(root, true);
  });
  root.querySelector("[data-profile-identity-cancel]")?.addEventListener("click", () => {
    toggleIdentityForm(root, false);
  });
  root.querySelector<HTMLFormElement>("[data-profile-identity-form-el]")?.addEventListener(
    "submit",
    (ev) => {
      ev.preventDefault();
      const form = ev.currentTarget as HTMLFormElement;
      void saveBioFromForm(vault, identityFromForm(form)).then(onDone);
    },
  );
}

export function bindProfileSeeds(
  root: HTMLElement,
  vault: ProfileVault,
  onDone: () => void,
): void {
  bindProfileIdentity(root, vault, onDone);
  root.querySelector("[data-profile-seed-bio]")?.addEventListener("click", () => {
    void vault
      .upsertLayer("biography", "Beginnings", "A first chapter of your living biography.")
      .then(onDone);
  });
  root.querySelector("[data-profile-seed-fact]")?.addEventListener("click", () => {
    void vault
      .upsertLayer("facts", "Values curiosity", "You notice and keep what matters.")
      .then(onDone);
  });
}
