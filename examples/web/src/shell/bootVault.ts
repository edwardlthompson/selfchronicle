import type { AppShellState } from "../AppShell";
import type { ProfileVault } from "../vault";
import type { WelcomeSession } from "../welcome/session";

/** After vault.open: show Welcome on empty vault, else refresh UI. */
export async function gateFirstRun(opts: {
  vault: ProfileVault;
  welcome: WelcomeSession;
  state: AppShellState;
  setState: (s: AppShellState) => void;
  render: () => void;
  refreshVaultUi: () => Promise<void>;
}): Promise<void> {
  if (await opts.welcome.shouldShow(opts.vault)) {
    opts.setState({
      ...opts.state,
      route: "welcome",
      welcomeHtml: opts.welcome.html(),
    });
    opts.render();
    return;
  }
  await opts.refreshVaultUi();
}
