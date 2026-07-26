import type { SearchHit, VaultDocument } from "../vault";
import { t } from "../i18n";
import { highlightQuery } from "./fts";

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderAuditSearch(opts: {
  query: string;
  hits: SearchHit[];
  recent: VaultDocument[];
}): string {
  const list =
    opts.query.trim().length > 0
      ? opts.hits.length === 0
        ? `<p class="gp-body">${t("search.empty")}</p>`
        : `<ul data-testid="search-hits">${opts.hits
            .map(
              (h) =>
                `<li data-hit="${escape(h.id)}"><code>${escape(h.path)}</code> — ${escape(highlightQuery(h.title, opts.query))} <em>(${escape(h.type)})</em></li>`,
            )
            .join("")}</ul>`
      : `<ul data-testid="audit-recent">${opts.recent
          .slice(0, 20)
          .map(
            (d) =>
              `<li><code>${escape(d.path)}</code> — ${escape(d.frontmatter.type)}</li>`,
          )
          .join("")}</ul>`;

  return `<section data-testid="audit-search">
    <h2>${t("search.title")}</h2>
    <label>${t("search.label")} <input type="search" data-vault-search value="${escape(opts.query)}" placeholder="${t("search.placeholder")}"/></label>
    ${list}
  </section>`;
}
