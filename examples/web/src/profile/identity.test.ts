import { describe, expect, it } from "vitest";
import type { VaultDocument } from "../vault/types";
import {
  computeAgeFromDob,
  emptyIdentity,
  extractFromFacts,
  formatAgeLabel,
  hasIdentityContent,
  mergeIdentity,
} from "./identity";

function fact(title: string, body: string): VaultDocument {
  return {
    path: `facts/x.md`,
    body,
    frontmatter: {
      id: "f1",
      type: "fact",
      title,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      ingested_at: "2026-01-01T00:00:00Z",
      tags: [],
      status: "active",
      user_edited: true,
      provenance: { source: "manual" },
      links: { evidence: [], facts: [], attachments: [] },
    },
  };
}

describe("profile identity", () => {
  it("computes age from DOB", () => {
    expect(computeAgeFromDob("1990-07-26", new Date("2026-07-26T12:00:00Z"))).toBe(36);
    expect(computeAgeFromDob("1990-07-27", new Date("2026-07-26T12:00:00Z"))).toBe(35);
    expect(computeAgeFromDob("not-a-date")).toBeNull();
  });

  it("prefers DOB-derived age in formatAgeLabel", () => {
    const id = { ...emptyIdentity(), dateOfBirth: "2000-01-15", age: 99 };
    expect(formatAgeLabel(id, new Date("2026-07-26"))).toBe("26");
  });

  it("extracts common fact titles", () => {
    const patch = extractFromFacts([
      fact("Full name", "Alex Rivera"),
      fact("Home address", "12 Oak St, Portland"),
      fact("Occupation", "Teacher, writer"),
    ]);
    expect(patch.displayName).toBe("Alex Rivera");
    expect(patch.homeAddress).toBe("12 Oak St, Portland");
    expect(patch.occupations).toEqual(["Teacher", "Writer"]);
  });

  it("parses GitHub identity fact", () => {
    const patch = extractFromFacts([
      fact(
        "GitHub identity",
        'Uses edwar on GitHub; location Seattle; bio “Building tools.”',
      ),
    ]);
    expect(patch.displayName).toBe("edwar");
    expect(patch.homeAddress).toBe("Seattle");
  });

  it("merge prefers user-edited stored fields", () => {
    const merged = mergeIdentity({
      stored: {
        ...emptyIdentity(),
        displayName: "Preferred Name",
        user_edited: true,
        updated_at: "2026-01-01",
      },
      facts: [fact("Full name", "From Facts")],
      chapters: [],
      meta: null,
      drive: null,
    });
    expect(merged.displayName).toBe("Preferred Name");
  });

  it("hasIdentityContent is false for empty identity", () => {
    expect(hasIdentityContent(emptyIdentity())).toBe(false);
    expect(hasIdentityContent({ ...emptyIdentity(), email: "a@b.co" })).toBe(true);
  });
});
