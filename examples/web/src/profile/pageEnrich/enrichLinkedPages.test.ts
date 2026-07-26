import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ProfileVault } from "../../vault/profileVault";
import { collectEnrichableUrls, isEnrichableProfileUrl } from "./collectUrls";
import { parseImdbNameHtml } from "./parseImdbHtml";
import { formatPageEnrichEvidence } from "./formatEvidence";
import { enrichLinkedPagesFromVault } from "./enrichLinkedPages";
import { extractFromEvidence } from "../identityExtract";
import { resolveProfileIdentity } from "../bioVault";

describe("pageEnrich collectUrls", () => {
  it("detects IMDb name profile URLs", () => {
    expect(isEnrichableProfileUrl("https://www.imdb.com/name/nm1234567/")).toBe(true);
    expect(isEnrichableProfileUrl("https://example.dev")).toBe(false);
  });

  it("collects deduped enrichable URLs from evidence text", () => {
    const urls = collectEnrichableUrls([
      "Portal lists https://www.imdb.com/name/nm1234567/ and mirror https://imdb.com/name/nm1234567",
    ]);
    expect(urls).toEqual(["https://www.imdb.com/name/nm1234567/"]);
  });
});

describe("parseImdbNameHtml", () => {
  it("parses synthetic IMDb fixture into Actor, Model, and credits", () => {
    const fix = join(import.meta.dirname, "../../../../../fixtures/page-enrich");
    const html = readFileSync(join(fix, "imdb-name-synthetic.html"), "utf8");
    const parsed = parseImdbNameHtml(html);
    expect(parsed.displayName).toBe("Alex Example");
    expect(parsed.occupations).toEqual(expect.arrayContaining(["Actor", "Model"]));
    expect(parsed.creditSamples).toEqual(expect.arrayContaining(["Sample Film Alpha", "Sample Film Beta"]));
  });
});

describe("enrichLinkedPagesFromVault", () => {
  it("writes provisional evidence and re-distills occupations without live network", async () => {
    const fix = join(import.meta.dirname, "../../../../../fixtures/page-enrich");
    const html = readFileSync(join(fix, "imdb-name-synthetic.html"), "utf8");
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      text: async () => html,
    })) as unknown as typeof fetch;

    const vault = new ProfileVault({ persist: false });
    await vault.open();
    await vault.appendEvidence({
      title: "LinksLander personal site (public)",
      body: "Site hint: https://example.dev\nIMDb: https://www.imdb.com/name/nm1234567/",
      tags: ["linkslander", "provisional"],
      source: "other_archive",
      channel: "other",
    });

    const result = await enrichLinkedPagesFromVault(vault, { fetchImpl, force: true });
    expect(result.attempted).toBe(1);
    expect(result.enriched).toBe(1);
    expect(fetchImpl).toHaveBeenCalledOnce();

    const evidence = await vault.listEvidence();
    const enrichDoc = evidence.find((d) => d.frontmatter.tags.includes("page_enrich"));
    expect(enrichDoc?.body).toContain("User-initiated page enrichment");
    expect(enrichDoc?.body).toContain("Sample Film Alpha");

    const identity = await resolveProfileIdentity(vault);
    expect(identity.occupations).toEqual(expect.arrayContaining(["Actor", "Model"]));
  });

  it("retains link-only Actor inference when fetch fails", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;

    const vault = new ProfileVault({ persist: false });
    await vault.open();
    await vault.appendEvidence({
      title: "LinksLander deep dive",
      body: "https://www.imdb.com/name/nm1234567/",
      tags: ["linkslander"],
      source: "other_archive",
      channel: "other",
    });

    const result = await enrichLinkedPagesFromVault(vault, { fetchImpl, force: true });
    expect(result.failed).toBe(1);
    expect(result.summary).toBe("fetch_failed_link_inference_retained");

    const patch = extractFromEvidence(await vault.listEvidence());
    expect(patch.occupations).toContain("Actor");

    const body = formatPageEnrichEvidence(
      {
        url: "https://www.imdb.com/name/nm1234567/",
        occupations: [],
        creditSamples: [],
        fetchError: "fetch_blocked",
      },
      "2026-07-26T00:00:00.000Z",
    );
    expect(body).toContain("fetch_failed");
    expect(body).toContain("Link-only inference retained");
  });
});
