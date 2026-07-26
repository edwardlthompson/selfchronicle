import type { AppShellState } from "../AppShell";
import type { ProfileVault } from "../vault";
import {
  bindLearn,
  initialLearnModel,
  learnHtml,
  refreshDistill,
  type LearnModel,
} from "./learnUi";

export function createLearnSession(): {
  html: () => string;
  refresh: (vault: ProfileVault) => Promise<void>;
  bind: (root: HTMLElement, vault: ProfileVault, onRender: () => void) => void;
  patchState: (state: AppShellState) => AppShellState;
} {
  let model: LearnModel = initialLearnModel();
  return {
    html: () => learnHtml(model),
    async refresh(vault) {
      model = await refreshDistill(vault, model);
    },
    bind(root, vault, onRender) {
      bindLearn(root, vault, () => model, (m) => {
        model = m;
      }, onRender);
    },
    patchState(state) {
      return { ...state, learnHtml: learnHtml(model) };
    },
  };
}
