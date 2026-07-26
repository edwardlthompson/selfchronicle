import type { DonationConfig } from "./about/types";
import { createThemeToggle } from "./components/ThemeToggle";
import { t } from "./i18n";
import { SHELL_ROUTES, type ShellRoute } from "./shell/nav";
import { mountSettingsOrAbout, renderVaultPanelHtml } from "./shell/panelMount";
import { renderTodayView, type TodayViewModel } from "./shell/TodayView";

let dialogCleanup: (() => void) | undefined;

export type AppShellState = {
  showAbout: boolean;
  showSettings: boolean;
  updateStatus: string;
  donations: DonationConfig;
  route: ShellRoute;
  today: TodayViewModel;
  profileHtml?: string;
  learnHtml?: string;
  handoffHtml?: string;
  welcomeHtml?: string;
  searchQuery?: string;
  focusBannerHtml?: string;
};

export type AppShellCallbacks = {
  onState: (next: Partial<AppShellState>) => void;
  onUpdateCheckChange?: (enabled: boolean) => void;
  onApplyUpdate?: () => void;
  canApplyUpdate?: boolean;
  onSaveNote?: (text: string) => void;
  onNavigate?: (route: ShellRoute) => void;
};

export function createAppShell(
  root: HTMLElement,
  state: AppShellState,
  callbacks: AppShellCallbacks,
): void {
  const currentUpdateLabel = t("about.update.current");
  const showHomeUpdate = state.updateStatus !== currentUpdateLabel;
  const nav = SHELL_ROUTES.map(
    (r) =>
      `<button type="button" class="sc-nav-btn${state.route === r.id ? " is-active" : ""}" data-nav="${r.id}" aria-current="${state.route === r.id ? "page" : "false"}">${t(r.labelKey)}</button>`,
  ).join("");

  const onWelcome = state.route === "welcome";
  let mainBody = "";
  if (onWelcome) {
    mainBody =
      state.welcomeHtml ??
      `<section data-testid="welcome-home"><p class="gp-body">${t("welcome.title")}</p></section>`;
  } else if (state.route === "today") mainBody = renderTodayView(state.today);
  else if (state.route === "profile") {
    mainBody =
      state.profileHtml ??
      `<section data-testid="profile-stub"><p class="gp-body">${t("profile.stub")}</p></section>`;
  } else if (state.route === "learn") {
    mainBody =
      state.learnHtml ??
      `<section data-testid="learn-stub"><p class="gp-body">${t("learn.intro")}</p></section>`;
  } else if (state.route === "vault") {
    mainBody = renderVaultPanelHtml(state.today.vault);
  } else if (state.route === "handoff") {
    mainBody =
      state.handoffHtml ??
      `<section data-testid="handoff-stub"><p class="gp-body">${t("handoff.intro")}</p></section>`;
  } else {
    mainBody = `<section class="sc-trust" data-testid="trust-panel"><h2>${t("trust.privacy_title")}</h2><p class="gp-body">${t("trust.privacy_body")}</p><p class="gp-body">${t("first_run.body")}</p><div data-dc-settings-mount></div></section>`;
  }

  root.innerHTML = `
    <main>
      <div class="gp-header">
        <h1 class="gp-title">${t("app.title")}</h1>
        <div class="gp-header-actions">
          <button type="button" class="gp-settings-btn" data-settings-open aria-label="${t("settings.open")}">⚙</button>
          <button type="button" class="gp-about-btn" data-about-open aria-label="${t("about.open")}">i</button>
        </div>
      </div>
      ${onWelcome ? "" : `<nav class="sc-nav" aria-label="Primary">${nav}</nav>`}
      ${onWelcome ? "" : (state.focusBannerHtml ?? "")}
      ${
        !onWelcome && showHomeUpdate
          ? `<p class="gp-update-banner" data-testid="home-update-status" aria-live="polite">${state.updateStatus}</p>`
          : ""
      }
      <div data-route-mount>${mainBody}</div>
      <div data-panel-mount></div>
    </main>
  `;

  const actions = root.querySelector<HTMLDivElement>(".gp-header-actions");
  if (actions) actions.insertBefore(createThemeToggle(), actions.firstChild);

  root.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = (el as HTMLElement).dataset.nav as ShellRoute;
      callbacks.onNavigate?.(id);
      callbacks.onState({ route: id, showAbout: false, showSettings: false });
    });
  });
  root.querySelector("[data-about-open]")?.addEventListener("click", () => {
    callbacks.onState({ showAbout: !state.showAbout, showSettings: false });
  });
  root.querySelector("[data-settings-open]")?.addEventListener("click", () => {
    // Gear opens the Settings route (privacy / Day Close / Focus / MCP).
    // Theme + updates stay in the floating panel (toggle when already on Settings).
    const onSettings = state.route === "settings";
    callbacks.onState({
      showSettings: onSettings ? !state.showSettings : false,
      showAbout: false,
      route: "settings",
    });
  });
  root.querySelector("[data-testid=note-save]")?.addEventListener("click", () => {
    const area = root.querySelector<HTMLTextAreaElement>("[data-testid=note-draft]");
    callbacks.onSaveNote?.(area?.value ?? "");
  });

  const mount = root.querySelector("[data-panel-mount]");
  if (!mount) return;
  dialogCleanup?.();
  dialogCleanup = mountSettingsOrAbout(mount, {
    showSettings: state.showSettings,
    showAbout: state.showAbout,
    updateStatus: state.updateStatus,
    donations: state.donations,
    canApplyUpdate: callbacks.canApplyUpdate,
    onCloseSettings: () => callbacks.onState({ showSettings: false }),
    onCloseAbout: () => callbacks.onState({ showAbout: false }),
    onUpdateCheckChange: callbacks.onUpdateCheckChange,
    onApplyUpdate: callbacks.onApplyUpdate,
  });
}
