import type { ProfileVault } from "../vault";
import {
  defaultWelcomeModel,
  renderWelcomeView,
} from "./WelcomeView";
import type { SeedBundle } from "../profile/seedBundle";
import { bindWelcomeSession } from "./bindWelcome";

export function createWelcomeSession() {
  let model = defaultWelcomeModel();
  let pending: SeedBundle | null = null;

  return {
    html: () => renderWelcomeView(model),
    model: () => model,
    reset: () => {
      model = defaultWelcomeModel();
      pending = null;
    },
    shouldShow: async (vault: ProfileVault) => (await vault.listEvidence()).length === 0,
    bind(root: HTMLElement, vault: ProfileVault, onDone: () => void, onSkip: () => void): void {
      bindWelcomeSession({
        root,
        vault,
        onDone,
        onSkip,
        getModel: () => model,
        setModel: (m) => {
          model = m;
        },
        patch: (p) => {
          model = { ...model, ...p };
        },
        getPending: () => pending,
        setPending: (b) => {
          pending = b;
        },
      });
    },
  };
}

export type WelcomeSession = ReturnType<typeof createWelcomeSession>;
