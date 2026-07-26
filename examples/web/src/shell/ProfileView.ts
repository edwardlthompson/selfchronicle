import { renderIdentityHeader } from "../components/profile/IdentityHeader";
import type { ResolvedIdentity } from "../profile/bio";
import { renderAuditSearch } from "../search/AuditSearchView";
import type { SearchHit, VaultDocument } from "../vault";
import { buildStatStory, buildTimeline } from "../timeline/build";
import { renderStatStoryCard, renderTimeline } from "../timeline/TimelineView";
import { t } from "../i18n";

export function renderProfileView(opts: {
  identity: ResolvedIdentity;
  facts: VaultDocument[];
  chapters: VaultDocument[];
  audit: VaultDocument[];
  onThisDay: VaultDocument[];
  searchQuery?: string;
  searchHits?: SearchHit[];
}): string {
  const facts =
    opts.facts.length === 0
      ? `<p class="gp-body">${t("profile.facts_empty")}</p>`
      : `<ul>${opts.facts.map((f) => `<li>${escape(f.frontmatter.title)}</li>`).join("")}</ul>`;
  const chapters =
    opts.chapters.length === 0
      ? `<p class="gp-body">${t("profile.bio_empty")}</p>`
      : opts.chapters
          .map(
            (c) =>
              `<article><h3>${escape(c.frontmatter.title)}</h3><p>${escape(c.body.slice(0, 280))}</p></article>`,
          )
          .join("");
  const otd =
    opts.onThisDay.length === 0
      ? ""
      : `<section data-testid="on-this-day"><h2>${t("profile.on_this_day")}</h2><ul>${opts.onThisDay
          .map((d) => `<li>${escape(d.frontmatter.title)}</li>`)
          .join("")}</ul></section>`;
  const timeline = renderTimeline(buildTimeline(opts.audit));
  const insights = renderStatStoryCard(buildStatStory(opts.audit));
  const audit = renderAuditSearch({
    query: opts.searchQuery ?? "",
    hits: opts.searchHits ?? [],
    recent: opts.audit,
  });

  const identity = renderIdentityHeader(opts.identity);

  // Human-first: identity + bio + facts above the fold; long audit timeline last.
  return `<section data-testid="profile-home">
    ${identity}
    <h2>${t("profile.biography")}</h2>
    ${chapters}
    <button type="button" data-profile-seed-bio>${t("profile.seed_bio")}</button>
    <button type="button" class="sc-btn" data-profile-enrich-links data-testid="profile-enrich-links">${t("profile.enrich_links")}</button>
    <p class="sc-identity-hint" data-testid="profile-enrich-hint">${t("profile.enrich_links_hint")}</p>
    <h2>${t("profile.facts")}</h2>
    ${facts}
    <button type="button" data-profile-seed-fact>${t("profile.seed_fact")}</button>
    ${otd}
    ${insights}
    ${audit}
    ${timeline}
  </section>`;
}

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
