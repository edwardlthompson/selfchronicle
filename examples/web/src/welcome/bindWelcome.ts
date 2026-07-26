import type { ProfileVault } from "../vault";
import { applySeedBundle } from "../profile/applySeed";
import type { SeedBundle } from "../profile/seedBundle";
import { bindWelcomeOutlets } from "./bindOutlets";
import { previewSeedBundle } from "./publicGithubImport";
import type { WelcomeModel } from "./types";

type BindCtx = {
  root: HTMLElement;
  vault: ProfileVault;
  onDone: () => void;
  onSkip: () => void;
  getModel: () => WelcomeModel;
  setModel: (m: WelcomeModel) => void;
  patch: (p: Partial<WelcomeModel>) => void;
  getPending: () => SeedBundle | null;
  setPending: (b: SeedBundle | null) => void;
};

function bindNav(ctx: BindCtx): void {
  const { root, onDone, onSkip, patch, getModel } = ctx;
  const redraw = (fn: () => void) => {
    fn();
    onDone();
  };
  root.querySelector("[data-welcome-next]")?.addEventListener("click", () => {
    redraw(() => patch({ step: "outlets", outlet: "", error: "" }));
  });
  root.querySelector("[data-welcome-skip]")?.addEventListener("click", () => onSkip());
  root.querySelector("[data-welcome-back]")?.addEventListener("click", () => {
    redraw(() =>
      patch({
        step: getModel().step === "review" ? "outlets" : "privacy",
        outlet: "",
        error: "",
      }),
    );
  });
  root.querySelector("[data-welcome-finish]")?.addEventListener("click", () => onSkip());
}

export function bindWelcomeSession(ctx: BindCtx): void {
  const showPreview = (bundle: SeedBundle) => {
    ctx.setPending(bundle);
    const prev = previewSeedBundle(bundle);
    ctx.setModel({
      ...ctx.getModel(),
      busy: false,
      step: "review",
      error: "",
      previewCount: prev.count,
      sampleTitles: prev.sampleTitles,
      hasLinksLander: prev.hasLinksLander,
    });
  };
  const run = (work: () => Promise<SeedBundle>) => {
    ctx.patch({ busy: true, error: "" });
    ctx.onDone();
    void work()
      .then((b) => {
        showPreview(b);
        ctx.onDone();
      })
      .catch((e) => {
        ctx.patch({ busy: false, error: e instanceof Error ? e.message : String(e) });
        ctx.onDone();
      });
  };

  bindNav(ctx);
  bindWelcomeOutlets({ ...ctx, run });

  ctx.root.querySelector("[data-welcome-commit]")?.addEventListener("click", () => {
    const pending = ctx.getPending();
    if (!pending) return;
    ctx.patch({ busy: true });
    ctx.onDone();
    void applySeedBundle(ctx.vault, pending).then((counts) => {
      ctx.setModel({
        ...ctx.getModel(),
        busy: false,
        step: "done",
        committed: `Evidence ${counts.evidence}, chapters ${counts.chapters}, facts ${counts.facts}.`,
      });
      ctx.setPending(null);
      ctx.onDone();
    });
  });
}
