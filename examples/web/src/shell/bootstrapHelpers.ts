import { applyPwaUpdate } from "../about/applyUpdate";
import type { AppShellState } from "../AppShell";
import { renderHandoffView } from "../handoff/HandoffView";
import { t } from "../i18n";
import type { createLearnSession } from "../learn/learnSession";
import type { WelcomeSession } from "../welcome/session";

type LearnLike = ReturnType<typeof createLearnSession>;

export function initialShellState(
  learn: LearnLike,
  welcome: WelcomeSession,
  focusBanners: string,
): AppShellState {
  return {
    showAbout: false,
    showSettings: false,
    updateStatus: t("about.update.current"),
    donations: { enabled: false, message: "", links: [] },
    route: "today",
    today: {
      vault: null,
      recent: [],
      noteDraft: "",
      message: "",
      dayCloseCueHtml: "",
      dayCloseRitualHtml: "",
    },
    profileHtml: "",
    learnHtml: learn.html(),
    handoffHtml: renderHandoffView(""),
    welcomeHtml: welcome.html(),
    searchQuery: "",
    focusBannerHtml: focusBanners,
  };
}

export async function applyUpdateIfReady(onStatus: (s: string) => void): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;
  if (await applyPwaUpdate(registration)) onStatus(t("about.update.restarting"));
}
