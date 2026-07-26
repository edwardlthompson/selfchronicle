import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  extractImdbProfileUrls,
  inferOccupationsFromImdbEvidence,
} from "./imdbOccupationInference";
import { extractFromEvidence } from "./identityExtract";
import { distillBioFromVault } from "./bioDistill";
import { mergeBio } from "./bioMerge";
import { emptyBio } from "./bioModel";
import type { VaultDocument } from "../vault/types";

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

describe("imdbOccupationInference", () => {
  it("extracts normalized IMDb name profile URLs", () => {
    const urls = extractImdbProfileUrls(
      "Portfolio: https://www.imdb.com/name/nm1234567/ and mirror https://imdb.com/name/nm1234567",
    );
    expect(urls).toEqual(["https://www.imdb.com/name/nm1234567/"]);
  });

  it("infers Actor from imdb.com/name/ link alone", () => {
    expect(
      inferOccupationsFromImdbEvidence("Listed: https://www.imdb.com/name/nm1234567/"),
    ).toEqual(["Actor"]);
  });

  it("infers Actor from IMDb nm token in link inventory table", () => {
    expect(inferOccupationsFromImdbEvidence("| IMDb | nm9876543 | Listed |")).toEqual(["Actor"]);
  });

  it("adds Model when lander bio co-mentions model with IMDb", () => {
    const body = [
      "| IMDb | https://www.imdb.com/name/nm1234567/ |",
      "Public bio describes professional model and photographer",
    ].join("\n");
    expect(inferOccupationsFromImdbEvidence(body)).toEqual(expect.arrayContaining(["Actor", "Model"]));
  });

  it("does not infer occupations without IMDb profile signal", () => {
    expect(inferOccupationsFromImdbEvidence("Tour guide and photographer only")).toEqual([]);
  });
});

describe("imdbOccupationInference integration", () => {
  it("extracts Actor and Model from linkslander evidence with IMDb URL", () => {
    const fix = join(import.meta.dirname, "../../../../fixtures/memory-disclosure");
    const body = readFileSync(join(fix, "linkslander-imdb-synthetic.md"), "utf8");
    const patch = extractFromEvidence([evidence("LinksLander deep dive", body, ["linkslander"])]);
    expect(patch.occupations).toEqual(expect.arrayContaining(["Actor", "Model"]));
    expect(patch.links).toContain("https://www.imdb.com/name/nm1234567/");
  });

  it("merges newly inferred Actor into stored bio on re-distill", () => {
    const stored = {
      ...emptyBio(),
      displayName: "Alex Rivera",
      occupations: ["Tour guide", "Photographer"],
    };
    const distilled = distillBioFromVault({
      facts: [],
      chapters: [],
      evidence: [
        evidence(
          "LinksLander personal site (public)",
          [
            "Site hint: https://example.dev",
            "Outbound: https://www.imdb.com/name/nm1234567/",
          ].join("\n"),
          ["linkslander"],
        ),
      ],
    });
    const merged = mergeBio({ stored, distilled, meta: null, drive: null });
    expect(merged.occupations).toEqual(expect.arrayContaining(["Tour guide", "Photographer", "Actor"]));
  });

  it("extracts Actor and Model from user-initiated page enrich evidence", () => {
    const body = [
      "User-initiated page enrichment (provisional).",
      "Source URL: https://www.imdb.com/name/nm1234567/",
      "Status: ok",
      "",
      "## Distilled biography signals",
      "- Professions (public page): Actor, Model",
      "- Sample credits (actor): Sample Film Alpha; Sample Film Beta",
    ].join("\n");
    const patch = extractFromEvidence([evidence("IMDb public page enrich (nm1234567)", body, ["page_enrich"])]);
    expect(patch.occupations).toEqual(expect.arrayContaining(["Actor", "Model"]));
  });
});
