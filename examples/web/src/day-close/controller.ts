import { t } from "../i18n";
import type { VaultPort } from "../vault";
import {
  renderDayCloseCue,
  renderDayCloseRitual,
  renderDayCloseSettings,
} from "./DayCloseView";
import {
  commitDayClose,
  initialRitual,
  pickQuestions,
  type RitualQuestion,
  type RitualState,
} from "./ritual";
import { loadFocusQuiet, saveFocusQuiet } from "../focus/settings";
import { shouldOfferCue } from "../focus/suppress";
import {
  loadDayCloseSettings,
  saveDayCloseSettings,
  type DayCloseSettings,
} from "./settings";

export type DayCloseController = {
  settings: DayCloseSettings;
  ritual: RitualState;
  questions: RitualQuestion[];
  snoozeUntil: number | null;
  cueHtml(): string;
  ritualHtml(): string;
  settingsHtml(): string;
  bind(root: HTMLElement, onChange: () => void, vault: VaultPort): void;
};

export function createDayCloseController(): DayCloseController {
  let settings = loadDayCloseSettings();
  let ritual = initialRitual();
  let snoozeUntil: number | null = null;
  const questions = pickQuestions(
    [
      { id: "q1", text: t("dayclose.q1") },
      { id: "q2", text: t("dayclose.q2") },
      { id: "q3", text: t("dayclose.q3") },
    ],
    3,
  );

  const api: DayCloseController = {
    get settings() {
      return settings;
    },
    get ritual() {
      return ritual;
    },
    get questions() {
      return questions;
    },
    get snoozeUntil() {
      return snoozeUntil;
    },
    cueHtml: () =>
      renderDayCloseCue(
        ritual.step === "idle" &&
          shouldOfferCue(settings, loadFocusQuiet(), snoozeUntil),
      ),
    ritualHtml: () => renderDayCloseRitual(ritual, questions),
    settingsHtml: () => renderDayCloseSettings(settings),
    bind(root, onChange, vault) {
      root.querySelector("[data-dc-begin]")?.addEventListener("click", () => {
        ritual = { ...initialRitual(), step: "recap" };
        onChange();
      });
      root.querySelector("[data-dc-snooze]")?.addEventListener("click", () => {
        snoozeUntil = Date.now() + settings.snoozeMinutes * 60_000;
        onChange();
      });
      root.querySelector("[data-dc-skip]")?.addEventListener("click", () => {
        snoozeUntil = Date.now() + 12 * 60 * 60_000;
        onChange();
      });
      root.querySelector("[data-dc-recap-next]")?.addEventListener("click", () => {
        const area = root.querySelector<HTMLTextAreaElement>("[data-dc-recap]");
        ritual = {
          ...ritual,
          recap: area?.value ?? "",
          step: questions.length ? "question" : "done",
          questionIndex: 0,
        };
        if (ritual.step === "done") {
          void commitDayClose(vault, settings, ritual, questions).then(onChange);
        } else onChange();
      });
      root.querySelector("[data-dc-recap-skip]")?.addEventListener("click", () => {
        ritual = {
          ...ritual,
          recap: "",
          step: questions.length ? "question" : "done",
        };
        if (ritual.step === "done") {
          void commitDayClose(vault, settings, ritual, questions).then(onChange);
        } else onChange();
      });
      root.querySelector("[data-dc-answer-next]")?.addEventListener("click", () => {
        const area = root.querySelector<HTMLTextAreaElement>("[data-dc-answer]");
        const q = questions[ritual.questionIndex];
        const answers = [...ritual.answers];
        if (q && area?.value.trim()) {
          answers.push({ questionId: q.id, text: area.value.trim() });
        }
        const next = ritual.questionIndex + 1;
        if (next >= questions.length) {
          ritual = { ...ritual, answers, step: "done" };
          void commitDayClose(vault, settings, ritual, questions).then(onChange);
        } else {
          ritual = { ...ritual, answers, questionIndex: next };
          onChange();
        }
      });
      root.querySelector("[data-dc-answer-skip]")?.addEventListener("click", () => {
        const next = ritual.questionIndex + 1;
        if (next >= questions.length) {
          ritual = { ...ritual, step: "done" };
          void commitDayClose(vault, settings, ritual, questions).then(onChange);
        } else {
          ritual = { ...ritual, questionIndex: next };
          onChange();
        }
      });
      root.querySelector("[data-dc-finish]")?.addEventListener("click", () => {
        ritual = initialRitual();
        onChange();
      });
      root.querySelector("[data-dc-enabled]")?.addEventListener("change", (e) => {
        settings = {
          ...settings,
          enabled: (e.target as HTMLInputElement).checked,
        };
        saveDayCloseSettings(settings);
        onChange();
      });
      root.querySelector("[data-dc-focus]")?.addEventListener("change", (e) => {
        const focusMode = (e.target as HTMLInputElement).checked;
        settings = { ...settings, focusMode };
        saveDayCloseSettings(settings);
        saveFocusQuiet({ ...loadFocusQuiet(), focusMode });
        onChange();
      });
    },
  };
  return api;
}
