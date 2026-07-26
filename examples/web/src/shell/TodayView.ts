import type { VaultDocument, VaultStatus } from "../vault";
import { t } from "../i18n";

export type TodayViewModel = {
  vault: VaultStatus | null;
  recent: VaultDocument[];
  noteDraft: string;
  message: string;
  dayCloseCueHtml?: string;
  dayCloseRitualHtml?: string;
};

export function renderTodayView(vm: TodayViewModel): string {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  const pathHint = vm.vault?.rootLabel ?? t("vault.path.unknown");
  const recent =
    vm.recent.length === 0
      ? `<p class="gp-body sc-empty" data-testid="today-empty">${t("today.empty")}</p>`
      : `<ul class="sc-recent" data-testid="today-recent">${vm.recent
          .slice(0, 5)
          .map(
            (d) =>
              `<li><span class="sc-path-hint">${d.path}</span> — ${escapeHtml(d.frontmatter.title)}</li>`,
          )
          .join("")}</ul>`;

  return `
    <section class="sc-today" data-testid="today-home">
      ${vm.dayCloseCueHtml ?? ""}
      ${vm.dayCloseRitualHtml ?? ""}
      <p class="gp-headline">${t("app.greeting")}</p>
      <p class="gp-body" data-testid="status">${
        offline ? t("app.status.offline") : t("app.status.online")
      }</p>
      <p class="sc-path-hint" data-testid="vault-path">${t("vault.path.label")}: ${escapeHtml(pathHint)}</p>
      ${
        offline
          ? ""
          : `<span class="sc-offline-pill" data-testid="online-pill" hidden></span>`
      }
      ${
        offline
          ? `<span class="sc-offline-pill" data-testid="offline-pill">${t("vault.offline_pill")}</span>`
          : ""
      }
      <h2 class="sc-section-title">${t("today.capture")}</h2>
      <label class="sc-label" for="sc-note">${t("today.note_label")}</label>
      <textarea id="sc-note" class="sc-textarea" data-testid="note-draft" rows="3">${escapeHtml(vm.noteDraft)}</textarea>
      <button type="button" class="sc-btn" data-testid="note-save">${t("today.save_note")}</button>
      ${vm.message ? `<p class="sc-msg" data-testid="note-msg" aria-live="polite">${escapeHtml(vm.message)}</p>` : ""}
      <h2 class="sc-section-title">${t("today.recent")}</h2>
      ${recent}
    </section>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
