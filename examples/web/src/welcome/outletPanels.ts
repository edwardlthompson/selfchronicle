import { t } from "../i18n";
import type { WelcomeModel } from "./types";

export function escapeWelcomeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function welcomeErrorHtml(m: WelcomeModel): string {
  return m.error
    ? `<p class="sc-welcome-error" role="alert">${escapeWelcomeHtml(m.error)}</p>`
    : "";
}

export function githubPanel(m: WelcomeModel): string {
  if (m.outlet !== "github") return "";
  const e = escapeWelcomeHtml;
  return `<div class="sc-outlet-panel sc-stack" data-testid="welcome-outlet-github">
    <label class="sc-field sc-field-row">
      <span>${t("welcome.username")}</span>
      <input type="text" data-welcome-username value="${e(m.username)}" placeholder="${e(t("welcome.username_placeholder"))}" autocomplete="username"/>
    </label>
    <button type="button" class="sc-btn" data-welcome-fetch ${m.busy ? "disabled" : ""}>
      ${m.busy ? t("welcome.fetching") : t("welcome.outlet_github_quick")}
    </button>
  </div>`;
}

export function linksPanel(m: WelcomeModel): string {
  if (m.outlet !== "linkslander") return "";
  const e = escapeWelcomeHtml;
  return `<div class="sc-outlet-panel sc-stack" data-testid="welcome-outlet-linkslander">
    <label class="sc-field sc-field-row">
      <span>${t("welcome.site_url")}</span>
      <input type="url" data-welcome-site value="${e(m.siteUrl)}" placeholder="${e(t("welcome.site_placeholder"))}"/>
    </label>
    <button type="button" class="sc-btn" data-welcome-site-import ${m.busy ? "disabled" : ""}>
      ${m.busy ? t("welcome.fetching") : t("welcome.import_site")}
    </button>
  </div>`;
}

export function drivePanel(m: WelcomeModel): string {
  if (m.outlet !== "drive") return "";
  const e = escapeWelcomeHtml;
  return `<div class="sc-outlet-panel sc-stack" data-testid="welcome-outlet-drive">
    <p class="gp-body">${t("welcome.drive_honest")}</p>
    <button type="button" class="sc-btn" data-welcome-drive-connect ${m.busy ? "disabled" : ""}>
      ${t("drive.connect_restore")}
    </button>
    <label class="sc-field sc-field-row">
      <span>${t("welcome.drive_upload")}</span>
      <input type="file" accept="application/json,.json" data-welcome-drive-file/>
    </label>
    <label class="sc-field sc-field-row">
      <span>${t("welcome.drive_paste")}</span>
      <textarea class="sc-textarea" data-welcome-paste rows="5">${e(m.pasteRaw)}</textarea>
    </label>
    <button type="button" class="sc-btn" data-welcome-pack-parse ${m.busy ? "disabled" : ""}>
      ${m.busy ? t("welcome.fetching") : t("welcome.parse_pack")}
    </button>
  </div>`;
}

export function pastePanel(m: WelcomeModel, mode: "chatgpt" | "paste"): string {
  if (m.outlet !== mode) return "";
  const e = escapeWelcomeHtml;
  const parseAttr = mode === "chatgpt" ? "data-welcome-chatgpt" : "data-welcome-paste-parse";
  const parseLabel = mode === "chatgpt" ? t("import.parse_chatgpt") : t("import.parse_paste");
  return `<div class="sc-outlet-panel sc-stack" data-testid="welcome-outlet-${mode}">
    <p class="gp-body">${t("welcome.paste_hint")}</p>
    <label class="sc-field sc-field-row">
      <span>${t("import.paste_label")}</span>
      <textarea class="sc-textarea" data-welcome-paste rows="6">${e(m.pasteRaw)}</textarea>
    </label>
    <button type="button" class="sc-btn" ${parseAttr} ${m.busy ? "disabled" : ""}>
      ${m.busy ? t("welcome.fetching") : parseLabel}
    </button>
  </div>`;
}
