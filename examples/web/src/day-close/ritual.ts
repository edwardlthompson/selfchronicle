import type { VaultPort } from "../vault";
import type { DayCloseSettings } from "./settings";

export type RitualQuestion = { id: string; text: string };

export type RitualState = {
  step: "idle" | "recap" | "question" | "done";
  questionIndex: number;
  recap: string;
  answers: { questionId: string; text: string }[];
};

export function initialRitual(): RitualState {
  return { step: "idle", questionIndex: 0, recap: "", answers: [] };
}

export function pickQuestions(
  pool: RitualQuestion[],
  max: number,
): RitualQuestion[] {
  return pool.slice(0, Math.min(3, max, pool.length));
}

export async function commitDayClose(
  vault: VaultPort,
  settings: DayCloseSettings,
  state: RitualState,
  questions: RitualQuestion[],
): Promise<string> {
  const parts: string[] = ["# Day Close", ""];
  if (state.recap.trim()) {
    parts.push("## Recap", "", state.recap.trim(), "");
  }
  for (const a of state.answers) {
    const q = questions.find((x) => x.id === a.questionId);
    parts.push(`## ${q?.text ?? a.questionId}`, "", a.text.trim(), "");
  }
  if (!state.recap.trim() && state.answers.length === 0) {
    parts.push("_Closed the day with a quiet skip._", "");
  }
  const body = parts.join("\n");
  const doc = await vault.appendEvidence({
    title: `Day Close — ${new Date().toISOString().slice(0, 10)}`,
    body,
    tags: ["day-close", "journal"],
    source: "day_close",
    channel: "journal",
  });
  void settings;
  return doc.path;
}
