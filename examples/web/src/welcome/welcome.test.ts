import { describe, expect, it, vi } from "vitest";
import { assembleGithubBundle } from "./assembleGithubBundle";
import {
  buildSiteUrlBundle,
  parseSeedPackJson,
  seedFromReview,
} from "./outletPacks";
import { importPublicGithubProfile, previewSeedBundle } from "./publicGithubImport";
import { createWelcomeSession } from "./session";
import { defaultWelcomeModel, renderWelcomeView } from "./WelcomeView";
import type { ProfileVault } from "../vault";

describe("welcome", () => {
  it("renders privacy step with empty personal defaults", () => {
    const m = defaultWelcomeModel();
    expect(m.username).toBe("");
    expect(m.siteUrl).toBe("");
    const html = renderWelcomeView(m);
    expect(html).toContain('data-testid="welcome-home"');
    expect(html).not.toContain("edwardlthompson");
  });

  it("renders outlet list without bundled personal demo", () => {
    const html = renderWelcomeView({ ...defaultWelcomeModel(), step: "outlets" });
    expect(html).toContain('data-testid="welcome-outlet-list"');
    expect(html).toContain('data-welcome-outlet="github"');
    expect(html).not.toContain("data-welcome-demo");
    expect(html).not.toContain("edwardlthompson");
    expect(html).toContain('data-welcome-outlet="linkslander"');
    expect(html).toContain('data-welcome-outlet="drive"');
    expect(html).toContain('data-testid="import-sources-guide"');
  });

  it("assembles evidence including site repo when present", () => {
    const bundle = assembleGithubBundle(
      {
        login: "sample-user",
        name: "Sample User",
        bio: "Demo bio",
        location: "Nowhere",
        created_at: "2020-01-01T00:00:00Z",
        public_repos: 2,
        html_url: "https://github.com/sample-user",
      },
      [
        {
          name: "cool-app",
          description: "demo",
          language: "TypeScript",
          fork: false,
          html_url: "https://github.com/sample-user/cool-app",
          license: { spdx_id: "MIT" },
        },
        {
          name: "linkslander-sample",
          description: "Portal at https://example.com",
          language: "Python",
          fork: false,
          html_url: "https://github.com/sample-user/linkslander-sample",
          license: { spdx_id: "MIT" },
        },
      ],
      ["TypeScript"],
      "2026-07-26",
    );
    const prev = previewSeedBundle(bundle);
    expect(prev.hasLinksLander).toBe(true);
    expect(prev.count).toBeGreaterThan(3);
  });

  it("builds site URL pointer without scraping", () => {
    const pack = buildSiteUrlBundle("https://example.com/me");
    expect(pack.evidence).toHaveLength(1);
    expect(pack.evidence[0]?.body).toContain("https://example.com/me");
    expect(pack.evidence[0]?.body).toContain("No page content was fetched");
  });

  it("parses Drive-style seed pack JSON", () => {
    const pack = parseSeedPackJson(
      JSON.stringify({
        evidence: [{ title: "From Drive", body: "hello", tags: ["pack"] }],
        chapters: [],
        facts: [{ title: "f", body: "b" }],
      }),
    );
    expect(pack.evidence[0]?.title).toBe("From Drive");
    expect(
      seedFromReview({
        adapter: "manual_paste",
        parser_version: "v1",
        count: 1,
        sampleTitles: ["a"],
        items: [{ title: "a", body: "b" }],
      }).evidence,
    ).toHaveLength(1);
  });

  it("does not fall back to a personal pack when fetch fails", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;
    await expect(importPublicGithubProfile("anyone", fetchImpl)).rejects.toThrow();
  });

  it("welcome session shows only on empty vault", async () => {
    const welcome = createWelcomeSession();
    const empty = {
      listEvidence: vi.fn(async () => []),
    } as unknown as ProfileVault;
    const filled = {
      listEvidence: vi.fn(async () => [{ path: "x.md" }]),
    } as unknown as ProfileVault;
    await expect(welcome.shouldShow(empty)).resolves.toBe(true);
    await expect(welcome.shouldShow(filled)).resolves.toBe(false);
  });
});
