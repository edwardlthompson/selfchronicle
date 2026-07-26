import { t } from "../i18n";
import type { RitualQuestion, RitualState } from "./ritual";
import type { DayCloseSettings } from "./settings";

export function renderDayCloseCue(show: boolean): string {
  if (!show) return "";
  return `<div class="sc-dayclose-cue" data-testid="dayclose-cue">
    <p>${t("dayclose.cue")}</p>
    <button type="button" data-dc-begin>${t("dayclose.begin")}</button>
    <button type="button" data-dc-snooze>${t("dayclose.snooze")}</button>
    <button type="button" data-dc-skip>${t("dayclose.skip")}</button>
  </div>`;
}

export function renderDayCloseRitual(
  state: RitualState,
  questions: RitualQuestion[],
): string {
  if (state.step === "idle") return "";
  if (state.step === "done") {
    return `<section data-testid="dayclose-done" class="sc-dayclose">
      <p class="gp-headline">${t("dayclose.goodnight")}</p>
      <p class="gp-body">${t("dayclose.saved")}</p>
      <button type="button" data-dc-finish>${t("dayclose.done")}</button>
    </section>`;
  }
  if (state.step === "recap") {
    return `<section data-testid="dayclose-recap" class="sc-dayclose">
      <p>${t("dayclose.recap_prompt")}</p>
      <textarea data-dc-recap rows="3">${escape(state.recap)}</textarea>
      <button type="button" data-dc-recap-next>${t("dayclose.continue")}</button>
      <button type="button" data-dc-recap-skip>${t("dayclose.skip_recap")}</button>
    </section>`;
  }
  const q = questions[state.questionIndex];
  if (!q) return "";
  return `<section data-testid="dayclose-q" class="sc-dayclose">
    <p class="sc-progress">${state.questionIndex + 1} / ${questions.length}</p>
    <p>${escape(q.text)}</p>
    <textarea data-dc-answer rows="3"></textarea>
    <button type="button" data-dc-answer-next>${t("dayclose.continue")}</button>
    <button type="button" data-dc-answer-skip>${t("dayclose.skip_question")}</button>
  </section>`;
}

export function renderDayCloseSettings(settings: DayCloseSettings): string {
  return `<section data-testid="dayclose-settings" class="sc-stack">
    <h2>${t("dayclose.settings_title")}</h2>
    <label class="sc-field">
      <input type="checkbox" data-dc-enabled ${settings.enabled ? "checked" : ""}/>
      <span>${t("dayclose.enable")}</span>
    </label>
    <label class="sc-field">
      <input type="checkbox" data-dc-focus ${settings.focusMode ? "checked" : ""}/>
      <span>${t("dayclose.focus")}</span>
    </label>
    <p class="gp-body">${t("dayclose.max_q")}</p>
  </section>`;
}

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
