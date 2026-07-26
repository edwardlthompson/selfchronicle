import type { DayCloseController } from "../day-close/controller";
import { buildHandoffPack } from "../handoff/buildPack";
import { renderHandoffView } from "../handoff/HandoffView";
import { bindImportPanel } from "../import/bind";
import type { createLearnSession } from "../learn/learnSession";
import { bindVaultSearch } from "../search/bind";
import type { ProfileVault } from "../vault";
import type { WelcomeSession } from "../welcome/session";
import type { AppShellState } from "../AppShell";
import { bindSettingsPanels } from "./settingsBind";
import { bindProfileSeeds } from "./vaultUi";

type FocusLike = {
  settingsHtml: () => string;
  bind: (root: HTMLElement, onChange: () => void) => void;
};

type LearnLike = ReturnType<typeof createLearnSession>;

export function bindPostRender(opts: {
  root: HTMLElement;
  vault: ProfileVault;
  dayClose: DayCloseController;
  focus: FocusLike;
  learn: LearnLike;
  welcome: WelcomeSession;
  afterSoftUi: () => void;
  refreshVaultUi: () => Promise<void>;
  getState: () => AppShellState;
  setState: (s: AppShellState) => void;
  render: () => void;
}): void {
  const {
    root,
    vault,
    dayClose,
    focus,
    learn,
    welcome,
    afterSoftUi,
    refreshVaultUi,
    getState,
    setState,
    render,
  } = opts;
  bindSettingsPanels(root, dayClose, focus, afterSoftUi, vault);
  bindProfileSeeds(root, vault, () => {
    void refreshVaultUi();
  });
  bindVaultSearch(root, (q) => {
    setState({ ...getState(), searchQuery: q });
    void refreshVaultUi();
  });
  learn.bind(root, vault, afterSoftUi);
  bindImportPanel(root, vault, () => {
    void refreshVaultUi();
  });
  if (getState().route === "welcome") {
    welcome.bind(
      root,
      vault,
      () => {
        setState({ ...getState(), welcomeHtml: welcome.html() });
        render();
      },
      () => {
        void refreshVaultUi().then(() => {
          setState({ ...getState(), route: "today", welcomeHtml: welcome.html() });
          render();
        });
      },
    );
  }
  root.querySelector("[data-import-open-welcome]")?.addEventListener("click", () => {
    welcome.reset();
    setState({ ...getState(), route: "welcome", welcomeHtml: welcome.html() });
    render();
  });
  root.querySelector("[data-handoff-build]")?.addEventListener("click", () => {
    void buildHandoffPack(vault).then((pack) => {
      setState({ ...getState(), handoffHtml: renderHandoffView(pack.handoffMd) });
      render();
    });
  });
}
