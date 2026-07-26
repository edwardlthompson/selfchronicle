import { acceptCandidate, buildReviewQueue, type DistillCandidate } from "../distill/queue";
import type { ProfileVault } from "../vault";
import {
  loadCuriosity,
  nextOpen,
  saveCuriosity,
  type CuriosityItem,
} from "./curiosity";
import { renderLearnView } from "./LearnView";
import { loadSoft, saveSoft, type SoftDoc } from "../soft/flags";

export type LearnModel = {
  curiosity: CuriosityItem[];
  draft: string;
  distill: DistillCandidate[];
  personality: SoftDoc;
  wellbeing: SoftDoc;
};

export function initialLearnModel(): LearnModel {
  const curiosity = loadCuriosity();
  return {
    curiosity,
    draft: "",
    distill: [],
    personality: loadSoft("personality"),
    wellbeing: loadSoft("wellbeing"),
  };
}

export async function refreshDistill(vault: ProfileVault, model: LearnModel): Promise<LearnModel> {
  return { ...model, distill: await buildReviewQueue(vault) };
}

export function learnHtml(model: LearnModel): string {
  return renderLearnView({
    curiosity: model.curiosity,
    current: nextOpen(model.curiosity),
    draft: model.draft,
    distill: model.distill,
    personality: model.personality,
    wellbeing: model.wellbeing,
  });
}

export function bindLearn(
  root: HTMLElement,
  vault: ProfileVault,
  getModel: () => LearnModel,
  setModel: (m: LearnModel) => void,
  redraw: () => void,
): void {
  root.querySelector("[data-learn-save]")?.addEventListener("click", () => {
    const model = getModel();
    const cur = nextOpen(model.curiosity);
    const area = root.querySelector<HTMLTextAreaElement>("[data-learn-answer]");
    const text = area?.value.trim() ?? "";
    if (!cur || !text) return;
    void vault
      .appendEvidence({
        title: `Learning: ${cur.question.slice(0, 60)}`,
        body: `Q: ${cur.question}\n\nA: ${text}`,
        tags: ["learning", ...cur.tags],
        source: "manual",
        channel: "journal",
      })
      .then(() => {
        const curiosity = model.curiosity.map((c) =>
          c.id === cur.id ? { ...c, status: "answered" as const } : c,
        );
        saveCuriosity(curiosity);
        setModel({ ...model, curiosity, draft: "" });
        redraw();
      });
  });
  root.querySelector("[data-learn-skip]")?.addEventListener("click", () => {
    const model = getModel();
    const cur = nextOpen(model.curiosity);
    if (!cur) return;
    const curiosity = model.curiosity.map((c) =>
      c.id === cur.id ? { ...c, status: "snoozed" as const } : c,
    );
    saveCuriosity(curiosity);
    setModel({ ...model, curiosity });
    redraw();
  });
  root.querySelectorAll("[data-distill-accept]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = (btn as HTMLElement).getAttribute("data-distill-accept");
      const model = getModel();
      const c = model.distill.find((d) => d.id === id);
      if (!c) return;
      void acceptCandidate(vault, c).then(() => {
        setModel({
          ...model,
          distill: model.distill.filter((d) => d.id !== c.id),
        });
        redraw();
      });
    });
  });
  root.querySelector("[data-soft-save-personality]")?.addEventListener("click", () => {
    const model = getModel();
    const body =
      root.querySelector<HTMLTextAreaElement>("[data-soft-personality]")?.value ?? "";
    const personality = { ...model.personality, body, user_edited: true };
    saveSoft(personality);
    setModel({ ...model, personality });
    redraw();
  });
  root.querySelector("[data-soft-save-wellbeing]")?.addEventListener("click", () => {
    const model = getModel();
    const body =
      root.querySelector<HTMLTextAreaElement>("[data-soft-wellbeing]")?.value ?? "";
    const enabled =
      root.querySelector<HTMLInputElement>("[data-soft-wb-enabled]")?.checked ?? false;
    const wellbeing = { ...model.wellbeing, body, enabled, user_edited: true };
    saveSoft(wellbeing);
    setModel({ ...model, wellbeing });
    redraw();
  });
}
