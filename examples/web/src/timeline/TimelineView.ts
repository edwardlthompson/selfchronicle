import { t } from "../i18n";
import type { TimelineNode } from "./build";

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderTimeline(nodes: TimelineNode[]): string {
  if (nodes.length === 0) {
    return `<section data-testid="timeline"><h2>${t("timeline.title")}</h2><p class="gp-body">${t("timeline.empty")}</p></section>`;
  }
  const items = nodes
    .slice(-30)
    .reverse()
    .map(
      (n) =>
        `<li data-timeline-node="${escape(n.id)}"><time>${escape(n.when)}</time> <span class="sc-layer">${escape(n.type)}</span> ${escape(n.title)}</li>`,
    )
    .join("");
  return `<section data-testid="timeline"><h2>${t("timeline.title")}</h2><ol class="sc-timeline">${items}</ol></section>`;
}

export function renderStatStoryCard(story: string): string {
  return `<section data-testid="stat-story" class="sc-stat-story">
    <h2>${t("timeline.insights")}</h2>
    <p class="gp-body">${escape(story)}</p>
  </section>`;
}
