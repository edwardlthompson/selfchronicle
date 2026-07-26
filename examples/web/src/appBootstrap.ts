import { handleRestartGuard, checkForUpdates } from "./about/aboutSession";
import { loadDonations } from "./about/donations";
import { createAppShell, type AppShellState } from "./AppShell";
import { createDayCloseController } from "./day-close/controller";
import { createFocusSession } from "./focus/session";
import { t } from "./i18n";
import { createLearnSession } from "./learn/learnSession";
import { attachRuntimeHooks } from "./shell/runtimeHooks";
import { applyUpdateIfReady, initialShellState } from "./shell/bootstrapHelpers";
import { bindPostRender } from "./shell/postRenderBind";
import { refreshVaultState } from "./shell/vaultUi";
import { initTheme, subscribeThemeChange } from "./theme";
import { ProfileVault } from "./vault";
import { createWelcomeSession } from "./welcome/session";
import { startVaultSession } from "./shell/vaultSession";

export function bootstrapApp(appRoot: HTMLDivElement, vault?: ProfileVault): void {
  const activeVault = vault ?? new ProfileVault();
  const dayClose = createDayCloseController();
  const learn = createLearnSession();
  const focus = createFocusSession();
  const welcome = createWelcomeSession();
  let state: AppShellState = initialShellState(learn, welcome, focus.banners());

  function syncChrome(): void {
    focus.reload();
    state = {
      ...state,
      focusBannerHtml: focus.banners(),
      today: {
        ...state.today,
        dayCloseCueHtml: dayClose.cueHtml(),
        dayCloseRitualHtml: dayClose.ritualHtml(),
      },
    };
  }

  async function refreshVaultUi(): Promise<void> {
    state = await refreshVaultState(activeVault, state);
    await learn.refresh(activeVault);
    state = learn.patchState(state);
    render();
  }

  function render(): void {
    syncChrome();
    state = learn.patchState(state);
    createAppShell(appRoot, state, {
      onState: (patch) => {
        state = { ...state, ...patch };
        render();
      },
      onUpdateCheckChange: (enabled) => {
        if (enabled) {
          void checkForUpdates().then((status) => {
            state = { ...state, updateStatus: status };
            render();
          });
        }
      },
      onApplyUpdate: () => {
        void applyUpdateIfReady((s) => {
          state = { ...state, updateStatus: s };
          render();
        });
      },
      canApplyUpdate: state.updateStatus.startsWith(t("about.update.available")),
      onSaveNote: (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        void activeVault
          .appendEvidence({
            title: trimmed.slice(0, 80),
            body: trimmed,
            tags: ["journal"],
            source: "manual",
            channel: "journal",
          })
          .then(async () => {
            state = {
              ...state,
              today: { ...state.today, noteDraft: "", message: t("today.saved") },
            };
            await refreshVaultUi();
          });
      },
      onNavigate: (route) => {
        state = { ...state, route };
      },
    });
    bindPostRender({
      root: appRoot,
      vault: activeVault,
      dayClose,
      focus,
      learn,
      welcome,
      afterSoftUi: () => {
        syncChrome();
        state = learn.patchState(state);
        render();
      },
      refreshVaultUi,
      render,
      getState: () => state,
      setState: (s) => {
        state = s;
      },
    });
  }

  initTheme();
  subscribeThemeChange(() => render());
  render();
  startVaultSession(activeVault, {
    welcome,
    state,
    setState: (s) => {
      state = s;
    },
    render,
    refreshVaultUi,
  });
  void loadDonations().then((d) => {
    state = { ...state, donations: d };
    render();
  });
  if (!handleRestartGuard()) {
    void checkForUpdates().then((s) => {
      state = { ...state, updateStatus: s };
      render();
    });
  }
  attachRuntimeHooks(render);
}
