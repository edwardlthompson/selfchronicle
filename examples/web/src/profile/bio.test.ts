import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { VaultDocument } from "../vault/types";
import { assembleGithubBundle } from "../welcome/assembleGithubBundle";
import { buildSiteUrlBundle } from "../welcome/outletPacks";
import { applySeedBundle } from "./applySeed";
import { distillBioFromVault } from "./bioDistill";
import { mergeBio, bioChanged } from "./bioMerge";
import { BIO_LAYER_PATH, emptyBio, parseStoredBio } from "./bioModel";
import { distillAndPersistBio, saveBioFromForm } from "./bioVault";
import { extractFromEvidence, extractFromFacts } from "./identityExtract";
import { ProfileVault } from "../vault/profileVault";

function fact(title: string, body: string): VaultDocument {
  return {
    path: "facts/x.md",
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
      user_edited: false,
      provenance: { source: "manual" },
      links: { evidence: [], facts: [], attachments: [] },
    },
  };
}

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

function chapter(title: string, body: string): VaultDocument {
  return {
    path: "biography/x.md",
    body,
    frontmatter: {
      id: "b1",
      type: "biography_chapter",
      title,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      ingested_at: "2026-01-01T00:00:00Z",
      tags: [],
      status: "active",
      user_edited: false,
      provenance: { source: "manual" },
      links: { evidence: [], facts: [], attachments: [] },
    },
  };
}

describe("bio distillation", () => {
  it("extracts GitHub-shaped evidence bodies", () => {
    const patch = extractFromEvidence([
      evidence(
        "GitHub public portfolio snapshot",
        [
          "Public GitHub snapshot for @alexdev (2026-07-26).",
          "Profile: Alex Rivera · Seattle · bio “Building tools.”",
          "Source: https://github.com/alexdev",
        ].join("\n"),
        ["github", "import"],
      ),
    ]);
    expect(patch.displayName).toBe("Alex Rivera");
    expect(patch.homeAddress).toBe("Seattle");
    expect(patch.links).toContain("https://github.com/alexdev");
  });

  it("extracts LinksLander site URL bundle facts", () => {
    const bundle = buildSiteUrlBundle("https://example.dev");
    const patch = extractFromFacts([
      fact(bundle.facts[0]!.title, bundle.facts[0]!.body),
    ]);
    expect(patch.links?.[0]).toMatch(/example\.dev/);
  });

  it("distills full GitHub + LinksLander seed bundle shape", () => {
    const bundle = assembleGithubBundle(
      {
        login: "alexdev",
        name: "Alex Rivera",
        bio: "Open-source builder.",
        location: "Portland, OR",
        created_at: "2015-03-01T00:00:00Z",
        public_repos: 12,
        html_url: "https://github.com/alexdev",
      },
      [
        {
          name: "linkslander-alex",
          description: "Personal portal — https://example.dev",
          language: "HTML",
          fork: false,
          html_url: "https://github.com/alexdev/linkslander-alex",
          license: { spdx_id: "MIT" },
        },
      ],
      ["TypeScript", "Python"],
      "2026-07-26",
    );

    const facts = bundle.facts.map((f) => fact(f.title, f.body));
    const chapters = bundle.chapters.map((c) => chapter(c.title, c.body));
    const ev = bundle.evidence.map((e) => evidence(e.title, e.body, e.tags));

    const { patch, sources } = distillBioFromVault({ facts, chapters, evidence: ev });
    expect(patch.displayName).toBe("Alex Rivera");
    expect(patch.homeAddress).toBe("Portland, OR");
    expect(patch.links?.some((u) => u.includes("example.dev") || u.includes("github.com"))).toBe(
      true,
    );
    expect(sources).toContain("GitHub import");
    expect(sources).toContain("LinksLander site");
  });

  it("persists profile/bio.json after seed commit", async () => {
    const vault = new ProfileVault({ persist: false });
    await vault.open();
    const bundle = assembleGithubBundle(
      {
        login: "alexdev",
        name: "Alex Rivera",
        bio: null,
        location: "Denver",
        created_at: "2015-03-01T00:00:00Z",
        public_repos: 3,
        html_url: "https://github.com/alexdev",
      },
      [],
      ["Rust"],
      "2026-07-26",
    );
    await applySeedBundle(vault, bundle);
    const raw = vault.readLayer(BIO_LAYER_PATH);
    expect(raw).toBeTruthy();
    const bio = parseStoredBio(raw!);
    expect(bio?.displayName).toBe("Alex Rivera");
    expect(bio?.homeAddress).toBe("Denver");
    expect(bio?.sources.length).toBeGreaterThan(0);
  });

  it("respects user-edited fields on re-distill", async () => {
    const vault = new ProfileVault({ persist: false });
    await vault.open();
    await saveBioFromForm(
      vault,
      {
        displayName: "Preferred Name",
        preferredName: "",
        dateOfBirth: "",
        age: null,
        homeAddress: "",
        email: "",
        phone: "",
        bioBlurb: "",
        links: [],
        occupations: [],
        languages: [],
        user_edited: true,
        updated_at: null,
      },
      ["displayName"],
    );
    await vault.upsertLayer("facts", "Full name", "From Facts");
    const bio = await distillAndPersistBio(vault);
    expect(bio.displayName).toBe("Preferred Name");
  });

  it("mergeBio detects changes", () => {
    const before = emptyBio();
    const after = mergeBio({
      stored: before,
      distilled: distillBioFromVault({
        facts: [fact("Full name", "Sam Lee")],
        chapters: [],
        evidence: [],
      }),
      meta: null,
      drive: null,
    });
    expect(bioChanged(before, after)).toBe(true);
    expect(after.displayName).toBe("Sam Lee");
  });

  it("re-distills many occupation chips from imported disclosure and linkslander evidence", () => {
    const fix = join(import.meta.dirname, "../../../../fixtures/memory-disclosure");
    const grokBody = readFileSync(join(fix, "multi-career-synthetic.md"), "utf8");
    const geminiBody = readFileSync(join(fix, "gemini-synthetic.md"), "utf8");
    const linksBody = readFileSync(join(fix, "linkslander-career-synthetic.md"), "utf8");
    const { patch } = distillBioFromVault({
      facts: [],
      chapters: [],
      evidence: [
        evidence("Grok memory disclosure report", grokBody, ["memory_disclosure"]),
        evidence("Gemini memory disclosure report", geminiBody, ["memory_disclosure"]),
        evidence("LinksLander deep dive", linksBody, ["linkslander"]),
      ],
    });
    expect(patch.occupations).toEqual(
      expect.arrayContaining([
        "Android developer",
        "FOSS contributor",
        "Tour guide",
        "Business owner",
        "Technical writer",
        "Photographer",
        "Amateur radio operator",
        "Crypto developer",
        "AI developer",
        "Software developer",
        "Python developer",
        "Web developer",
        "Model",
        "Race car driver",
        "Actor",
        "Freelancer",
        "Audio editor",
      ]),
    );
    expect(patch.occupations!.length).toBeGreaterThanOrEqual(15);
    expect(patch.occupations!.length).toBeLessThanOrEqual(25);
  });
});
