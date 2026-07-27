import { formatAgeLabel, hasIdentityContent } from "../../profile/identity";
import type { ResolvedIdentity } from "../../profile/bio";
import { BIO_LIMITS, prioritizeLinks, filterOccupations } from "../../profile/bioCompact";
import { t } from "../../i18n";
import { renderIdentityFormHtml } from "./identityForm";

export { identityFromForm } from "./identityForm";

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function field(labelKey: string, value: string): string {
  if (!value) return "";
  return `<div class="sc-identity-field">
    <span class="sc-identity-label">${escape(t(labelKey))}</span>
    <span class="sc-identity-value">${escape(value)}</span>
  </div>`;
}

function listField(labelKey: string, items: string[]): string {
  if (items.length === 0) return "";
  return field(labelKey, items.join(" · "));
}

function occupationChipsField(labelKey: string, items: string[]): string {
  if (items.length === 0) return "";
  const chips = items
    .map((item) => `<span class="sc-identity-chip">${escape(item)}</span>`)
    .join("");
  return `<div class="sc-identity-field sc-identity-occupations">
    <span class="sc-identity-label">${escape(t(labelKey))}</span>
    <span class="sc-identity-chips" data-testid="identity-occupations">${chips}</span>
  </div>`;
}

function compactLinks(links: string[]): string[] {
  return prioritizeLinks(links).slice(0, BIO_LIMITS.links);
}

function compactOccupations(items: string[]): string[] {
  return filterOccupations(items).slice(0, BIO_LIMITS.occupations);
}

/** Warm identity header pinned above Living Biography on Profile. */
export function renderIdentityHeader(identity: ResolvedIdentity): string {
  const populated = hasIdentityContent(identity);
  const age = formatAgeLabel(identity);
  const headline = identity.displayName || identity.preferredName;
  const subtitle =
    identity.displayName && identity.preferredName && identity.displayName !== identity.preferredName
      ? identity.preferredName
      : "";

  const dobLine =
    identity.dateOfBirth && !age
      ? identity.dateOfBirth.slice(0, 10)
      : age && identity.dateOfBirth
        ? `${age} · ${identity.dateOfBirth.slice(0, 10)}`
        : age ?? "";

  const links = compactLinks(identity.links);
  const occupations = compactOccupations(identity.occupations);
  const bioBlurb = identity.bioBlurb?.trim() ?? "";

  const fields = populated
    ? [
        dobLine ? field("profile.identity.age", dobLine) : "",
        field("profile.identity.address", identity.homeAddress),
        field("profile.identity.email", identity.email),
        field("profile.identity.phone", identity.phone),
        occupationChipsField("profile.identity.occupations", occupations),
        listField("profile.identity.links", links),
      ].join("")
    : "";

  const blurbLine = bioBlurb
    ? `<p class="sc-identity-bio" data-testid="identity-bio">${escape(bioBlurb)}</p>`
    : "";

  const learnedLine =
    identity.learnedFrom?.length && populated
      ? `<p class="sc-identity-learned" data-testid="identity-learned">${escape(
          t("profile.identity.learned_from").replace("{sources}", identity.learnedFrom.join(" · ")),
        )}</p>`
      : "";

  const body = populated
    ? `${blurbLine}<div class="sc-identity-grid" data-testid="identity-fields">${fields}</div>${learnedLine}`
    : `<p class="gp-body sc-identity-lede">${escape(t("profile.identity.empty_lede"))}</p>
       <p class="sc-identity-hint">${escape(t("profile.identity.empty_hint"))}</p>`;

  return `<header class="sc-identity${populated ? "" : " is-empty"}" data-testid="profile-identity">
    <div class="sc-identity-head">
      <h2 class="sc-identity-title">${escape(t("profile.identity.title"))}</h2>
      <button type="button" class="sc-btn sc-identity-edit-btn" data-profile-identity-edit>
        ${escape(populated ? t("profile.identity.edit") : t("profile.identity.add"))}
      </button>
    </div>
    ${headline ? `<p class="sc-identity-name" data-testid="identity-name">${escape(headline)}</p>` : ""}
    ${subtitle ? `<p class="sc-identity-preferred">${escape(subtitle)}</p>` : ""}
    ${body}
    ${renderIdentityFormHtml(identity)}
  </header>`;
}
