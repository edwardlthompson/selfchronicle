import { renderSoftPanels } from "../components/personality/SoftPanels";
import type { DistillCandidate } from "../distill/queue";
import type { SoftDoc } from "../soft/flags";
import { t } from "../i18n";
import type { CuriosityItem } from "./curiosity";

export function renderLearnView(opts: {
  curiosity: CuriosityItem[];
  current: CuriosityItem | null;
  draft: string;
  distill: DistillCandidate[];
  personality: SoftDoc;
  wellbeing: SoftDoc;
}): string {
  const q = opts.current
    ? `<section data-testid="learn-session">
        <h2>${t("learn.session")}</h2>
        <p>${escape(opts.current.question)}</p>
        <textarea data-learn-answer rows="4">${escape(opts.draft)}</textarea>
        <button type="button" data-learn-save>${t("learn.save")}</button>
        <button type="button" data-learn-skip>${t("learn.skip")}</button>
      </section>`
    : `<p class="gp-body" data-testid="learn-empty">${t("learn.empty")}</p>`;

  const queue = `<ul data-testid="curiosity-list">${opts.curiosity
    .map(
      (c) =>
        `<li data-cu="${c.id}">${escape(c.question)} <em>(${c.status})</em></li>`,
    )
    .join("")}</ul>`;

  const distill = `<section data-testid="distill-queue">
    <h2>${t("learn.distill")}</h2>
    ${
      opts.distill.length === 0
        ? `<p>${t("learn.distill_empty")}</p>`
        : opts.distill
            .slice(0, 5)
            .map(
              (d) =>
                `<div data-distill="${d.id}"><p>${escape(d.proposedTitle)}</p>
                <button type="button" data-distill-accept="${d.id}">${t("learn.accept_fact")}</button></div>`,
            )
            .join("")
    }
  </section>`;

  return `<section data-testid="learn-home">
    <p class="gp-body">${t("learn.intro")}</p>
    ${q}
    <h2>${t("learn.curiosity")}</h2>
    ${queue}
    ${distill}
    ${renderSoftPanels(opts.personality, opts.wellbeing)}
  </section>`;
}

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
