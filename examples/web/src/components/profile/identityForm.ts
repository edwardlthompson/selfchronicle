import type { ProfileIdentity } from "../../profile/identity";
import type { ResolvedIdentity } from "../../profile/bio";
import { BIO_LIMITS } from "../../profile/bioCompact";
import { t } from "../../i18n";

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Inline identity edit form (mounted inside IdentityHeader details). */
export function renderIdentityFormHtml(identity: ResolvedIdentity): string {
  return `<details class="sc-identity-form-wrap" data-profile-identity-form hidden>
    <summary class="sc-identity-form-summary">${escape(t("profile.identity.form_summary"))}</summary>
    <form class="sc-identity-form sc-stack" data-profile-identity-form-el>
      <label class="sc-field"><span>${escape(t("profile.identity.display_name"))}</span>
        <input name="displayName" value="${escape(identity.displayName)}" autocomplete="name" /></label>
      <label class="sc-field"><span>${escape(t("profile.identity.preferred_name"))}</span>
        <input name="preferredName" value="${escape(identity.preferredName)}" /></label>
      <label class="sc-field"><span>${escape(t("profile.identity.dob"))}</span>
        <input name="dateOfBirth" type="date" value="${escape(identity.dateOfBirth.slice(0, 10))}" /></label>
      <label class="sc-field"><span>${escape(t("profile.identity.address"))}</span>
        <input name="homeAddress" value="${escape(identity.homeAddress)}" autocomplete="street-address" /></label>
      <label class="sc-field"><span>${escape(t("profile.identity.email"))}</span>
        <input name="email" type="email" value="${escape(identity.email)}" autocomplete="email" /></label>
      <label class="sc-field"><span>${escape(t("profile.identity.phone"))}</span>
        <input name="phone" type="tel" value="${escape(identity.phone)}" autocomplete="tel" /></label>
      <label class="sc-field"><span>${escape(t("profile.identity.bio_blurb"))}</span>
        <textarea name="bioBlurb" rows="3" maxlength="${BIO_LIMITS.bioBlurb}">${escape(identity.bioBlurb)}</textarea></label>
      <label class="sc-field"><span>${escape(t("profile.identity.occupations"))}</span>
        <input name="occupations" value="${escape(identity.occupations.join(", "))}" /></label>
      <label class="sc-field"><span>${escape(t("profile.identity.languages"))}</span>
        <input name="languages" value="${escape(identity.languages.join(", "))}" /></label>
      <label class="sc-field"><span>${escape(t("profile.identity.links"))}</span>
        <input name="links" value="${escape(identity.links.join(", "))}" /></label>
      <div class="sc-field-row">
        <button type="submit" class="sc-btn" data-profile-identity-save>${escape(t("profile.identity.save"))}</button>
        <button type="button" class="sc-btn" data-profile-identity-cancel>${escape(t("profile.identity.cancel"))}</button>
      </div>
    </form>
  </details>`;
}

export function identityFromForm(form: HTMLFormElement): ProfileIdentity {
  const fd = new FormData(form);
  const split = (key: string) =>
    String(fd.get(key) ?? "")
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  return {
    displayName: String(fd.get("displayName") ?? "").trim(),
    preferredName: String(fd.get("preferredName") ?? "").trim(),
    dateOfBirth: String(fd.get("dateOfBirth") ?? "").trim(),
    age: null,
    homeAddress: String(fd.get("homeAddress") ?? "").trim(),
    email: String(fd.get("email") ?? "").trim(),
    phone: String(fd.get("phone") ?? "").trim(),
    bioBlurb: String(fd.get("bioBlurb") ?? "").trim(),
    links: split("links"),
    occupations: split("occupations"),
    languages: split("languages"),
    user_edited: true,
    updated_at: new Date().toISOString(),
  };
}
