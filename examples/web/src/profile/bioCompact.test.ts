import { describe, expect, it } from "vitest";
import {
  compactIdentityPatch,
  compactProfileBio,
  filterOccupations,
  isBioNoise,
  prioritizeLinks,
} from "./bioCompact";
import { emptyBio } from "./bioModel";
import { mergeBio } from "./bioMerge";
import { distillBioFromVault } from "./bioDistill";
import type { VaultDocument } from "../vault/types";

describe("bioCompact", () => {
  it("flags search queries and chat titles as noise", () => {
    expect(isBioNoise("searched for Kotlin coroutines")).toBe(true);
    expect(isBioNoise("Portable Unified AI memory architecture")).toBe(true);
    expect(isBioNoise("How to configure Gradle on Windows?")).toBe(true);
    expect(isBioNoise("Software developer")).toBe(false);
  });

  it("caps occupations and drops noise", () => {
    const items = [
      "Teacher",
      "searched for tour guide licensing",
      "Photographer",
      "Engineer",
      "Tour guide",
      "Actor",
      "TypeScript",
    ];
    expect(filterOccupations(items)).toEqual([
      "Actor",
      "Teacher",
      "Photographer",
      "Engineer",
      "Tour guide",
    ]);
  });

  it("prioritizes primary profile links", () => {
    const links = prioritizeLinks([
      "https://raw.githubusercontent.com/u/x/main/readme",
      "https://example.dev",
      "https://github.com/alexdev",
      "https://x.com/alexdev",
    ]);
    expect(links[0]).toBe("https://github.com/alexdev");
    expect(links).toContain("https://x.com/alexdev");
    expect(links.length).toBeLessThanOrEqual(4);
    expect(links.some((u) => u.includes("raw.githubusercontent"))).toBe(false);
  });

  it("compacts distilled patch", () => {
    const patch = compactIdentityPatch({
      displayName: "Alex",
      bioBlurb: "Building calm tools. ".repeat(40),
      occupations: ["Dev", "searched for React patterns", "Teacher"],
      links: ["https://github.com/alex", "https://duckduckgo.com/?q=test"],
    });
    expect(patch.bioBlurb!.length).toBeLessThanOrEqual(401);
    expect(patch.occupations).toEqual(["Dev", "Teacher"]);
    expect(patch.links?.some((u) => u.includes("duckduckgo"))).toBe(false);
  });

  it("prunes bloated stored bio on merge when not user-edited", () => {
    const stored = {
      ...emptyBio(),
      displayName: "Alex",
      occupations: [
        "Teacher",
        "searched for licensing",
        "Dev",
        "Actor",
        "Model",
        "Guide",
        "Extra",
      ],
      links: [
        "https://github.com/alex",
        "https://example.com/a",
        "https://example.com/b",
        "https://example.com/c",
        "https://example.com/d",
        "https://example.com/e",
      ],
    };
    const merged = mergeBio({
      stored,
      distilled: distillBioFromVault({ facts: [], chapters: [], evidence: [] }),
      meta: null,
      drive: null,
    });
    expect(merged.occupations.length).toBeLessThanOrEqual(25);
    expect(merged.links.length).toBeLessThanOrEqual(4);
    expect(merged.occupations.some((o) => /searched/i.test(o))).toBe(false);
    expect(merged.occupations).toContain("Actor");
  });

  it("preserves user-edited occupations without noise filtering", () => {
    const stored = {
      ...emptyBio(),
      displayName: "Alex",
      occupations: ["Custom role A", "Custom role B", "Custom role C", "Custom role D", "Custom role E"],
      edited_fields: ["occupations"] as const,
      user_edited: true,
    };
    const pruned = compactProfileBio(stored);
    expect(pruned.occupations).toHaveLength(5);
    expect(pruned.occupations[0]).toBe("Custom role A");
  });
});

function evidence(title: string, body: string, tags: string[] = []): VaultDocument {
  return {
    path: "evidence/x.md",
    body,
    frontmatter: {
      id: "e1",
      type: "evidence",
      title,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      ingested_at: "2026-01-01T00:00:00Z",
      tags,
      status: "active",
      user_edited: false,
      provenance: { source: "other_archive" },
      links: { evidence: [], facts: [], attachments: [] },
    },
  };
}

describe("bio distillation noise exclusion", () => {
  it("does not pull search queries from evidence bodies", () => {
    const { patch } = distillBioFromVault({
      facts: [],
      chapters: [],
      evidence: [
        evidence(
          "Grok chat export",
          [
            "Portable Unified AI Assistant Framework",
            "User searched for: tour guide certification Puerto Rico",
            "Research thread about Android Gradle JDK 21",
          ].join("\n"),
          ["grok_memory"],
        ),
      ],
    });
    expect(patch.occupations ?? []).toEqual([]);
    expect(patch.bioBlurb ?? "").toBe("");
    expect(patch.displayName ?? "").toBe("");
  });

  it("extracts GitHub bio blurb not as occupation list", () => {
    const { patch } = distillBioFromVault({
      facts: [],
      chapters: [],
      evidence: [
        evidence(
          "GitHub public portfolio snapshot",
          "Profile: Alex Rivera · Seattle · bio “Open-source builder.”\n@alexdev",
          ["github"],
        ),
      ],
    });
    expect(patch.bioBlurb).toBe("Open-source builder.");
    expect(patch.occupations ?? []).not.toContain("Open-source builder.");
  });
});
