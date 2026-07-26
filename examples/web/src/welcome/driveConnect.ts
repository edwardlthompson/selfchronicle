import type { ProfileVault } from "../vault";
import { connectDriveAndMerge } from "../sync/drive/reconcile";
import { isDriveConfigured } from "../sync/drive/config";
import type { WelcomeModel } from "./types";

export function bindWelcomeDriveConnect(opts: {
  root: HTMLElement;
  vault: ProfileVault;
  getModel: () => WelcomeModel;
  setModel: (m: WelcomeModel) => void;
  patch: (p: Partial<WelcomeModel>) => void;
  onDone: () => void;
}): void {
  opts.root.querySelector("[data-welcome-drive-connect]")?.addEventListener("click", () => {
    if (!isDriveConfigured()) {
      opts.patch({ error: "google_client_id_missing" });
      opts.onDone();
      return;
    }
    opts.patch({ busy: true, error: "" });
    opts.onDone();
    void connectDriveAndMerge(opts.vault)
      .then(({ identity, result }) => {
        if (result.evidenceCount > 0) {
          opts.setModel({
            ...opts.getModel(),
            busy: false,
            step: "done",
            committed: `${result.message} — ${identity.email} (${result.evidenceCount} evidence).`,
          });
          opts.onDone();
          return;
        }
        opts.patch({
          busy: false,
          error: result.merged ? "" : "No vault yet — upload a pack JSON below.",
        });
        opts.onDone();
      })
      .catch((e) => {
        opts.patch({ busy: false, error: e instanceof Error ? e.message : String(e) });
        opts.onDone();
      });
  });
}
