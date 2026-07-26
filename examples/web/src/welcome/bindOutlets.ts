import type { ProfileVault } from "../vault";
import type { SeedBundle } from "../profile/seedBundle";
import { getImportSource } from "../import/ImportSourcesCatalog";
import { setImportSelectedFormat } from "../import/session";
import {
  buildSiteUrlBundle,
  parseOutletByFormat,
  parseOutletPaste,
  parseSeedPackJson,
} from "./outletPacks";
import { importPublicGithubProfile } from "./publicGithubImport";
import { bindWelcomeDriveConnect } from "./driveConnect";
import type { WelcomeModel, WelcomeOutlet } from "./types";

type OutletCtx = {
  root: HTMLElement;
  vault: ProfileVault;
  onDone: () => void;
  getModel: () => WelcomeModel;
  setModel: (m: WelcomeModel) => void;
  patch: (p: Partial<WelcomeModel>) => void;
  run: (work: () => Promise<SeedBundle>) => void;
};

export function bindWelcomeOutlets(ctx: OutletCtx): void {
  const { root, patch, getModel, onDone, run } = ctx;
  const redraw = (fn: () => void) => {
    fn();
    onDone();
  };

  root.querySelectorAll<HTMLElement>("[data-welcome-outlet]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = (el.dataset.welcomeOutlet ?? "") as WelcomeOutlet;
      redraw(() =>
        patch({ outlet: getModel().outlet === id ? "" : id, error: "", pasteRaw: "" }),
      );
    });
  });
  root.querySelectorAll<HTMLElement>("[data-import-select-format]").forEach((el) => {
    el.addEventListener("click", () => {
      const fmt = el.dataset.importSelectFormat ?? "manual_paste";
      setImportSelectedFormat(fmt);
      const mapped = getImportSource(fmt)?.welcomeOutlet ?? "paste";
      redraw(() =>
        patch({ selectedFormat: fmt, outlet: mapped, error: "", pasteRaw: getModel().pasteRaw }),
      );
    });
  });

  const usernameInput = root.querySelector<HTMLInputElement>("[data-welcome-username]");
  usernameInput?.addEventListener("change", () => patch({ username: usernameInput.value.trim() }));
  const siteInput = root.querySelector<HTMLInputElement>("[data-welcome-site]");
  siteInput?.addEventListener("change", () => patch({ siteUrl: siteInput.value.trim() }));
  const pasteEl = root.querySelector<HTMLTextAreaElement>("[data-welcome-paste]");
  pasteEl?.addEventListener("change", () => patch({ pasteRaw: pasteEl.value }));

  root.querySelector("[data-welcome-fetch]")?.addEventListener("click", () => {
    patch({ username: usernameInput?.value.trim() || getModel().username });
    run(() => importPublicGithubProfile(usernameInput?.value.trim() || getModel().username));
  });
  root.querySelector("[data-welcome-site-import]")?.addEventListener("click", () => {
    patch({ siteUrl: siteInput?.value.trim() || getModel().siteUrl });
    run(async () => buildSiteUrlBundle(siteInput?.value.trim() || getModel().siteUrl));
  });
  root.querySelector("[data-welcome-pack-parse]")?.addEventListener("click", () => {
    run(async () => parseSeedPackJson(pasteEl?.value ?? getModel().pasteRaw));
  });
  root.querySelector("[data-welcome-chatgpt]")?.addEventListener("click", () => {
    const raw = pasteEl?.value ?? getModel().pasteRaw;
    const fmt = getModel().selectedFormat || "chatgpt_json";
    run(() =>
      fmt === "chatgpt_json" || getModel().outlet === "chatgpt"
        ? parseOutletPaste("chatgpt", raw)
        : parseOutletByFormat(fmt, raw),
    );
  });
  root.querySelector("[data-welcome-paste-parse]")?.addEventListener("click", () => {
    const raw = pasteEl?.value ?? getModel().pasteRaw;
    const fmt = getModel().selectedFormat || "manual_paste";
    run(() =>
      fmt === "manual_paste" ? parseOutletPaste("paste", raw) : parseOutletByFormat(fmt, raw),
    );
  });
  bindWelcomeDriveConnect({
    root: ctx.root,
    vault: ctx.vault,
    getModel: ctx.getModel,
    setModel: ctx.setModel,
    patch: ctx.patch,
    onDone: ctx.onDone,
  });
  root.querySelector<HTMLInputElement>("[data-welcome-drive-file]")?.addEventListener(
    "change",
    (ev) => {
      const file = (ev.target as HTMLInputElement).files?.[0];
      if (!file) return;
      run(async () => parseSeedPackJson(await file.text()));
    },
  );
}
