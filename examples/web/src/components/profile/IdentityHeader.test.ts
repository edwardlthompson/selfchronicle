import { describe, expect, it } from "vitest";
import { emptyIdentity } from "../../profile/identity";
import { renderIdentityHeader } from "./IdentityHeader";

describe("IdentityHeader", () => {
  it("renders empty invite state", () => {
    const html = renderIdentityHeader(emptyIdentity());
    expect(html).toContain('data-testid="profile-identity"');
    expect(html).toContain("is-empty");
    expect(html).toContain("Tell SelfChronicle who you are");
  });

  it("renders populated identity fields without languages wall", () => {
    const html = renderIdentityHeader({
      ...emptyIdentity(),
      displayName: "Alex",
      homeAddress: "Portland",
      occupations: ["Teacher", "Photographer"],
      languages: ["English", "Spanish", "French"],
      bioBlurb: "Building calm personal tools.",
    });
    expect(html).toContain('data-testid="identity-name"');
    expect(html).toContain("Alex");
    expect(html).toContain("Portland");
    expect(html).toContain('data-testid="identity-occupations"');
    expect(html).toContain("Occupations, passions &amp; hobbies");
    expect(html).toContain('class="sc-identity-chip"');
    expect(html).toContain("Teacher");
    expect(html).toContain("Photographer");
    expect(html).toContain('data-testid="identity-bio"');
    expect(html).toContain("Building calm personal tools.");
    expect(html).not.toContain("sc-identity-label\">Languages");
  });

  it("renders learned-from line when sources present", () => {
    const html = renderIdentityHeader({
      ...emptyIdentity(),
      displayName: "Alex",
      homeAddress: "Portland",
      learnedFrom: ["GitHub import", "LinksLander site"],
    });
    expect(html).toContain('data-testid="identity-learned"');
    expect(html).toContain("GitHub import");
  });
});
