import { describe, expect, it } from "vitest";
import {
  extractOccupationTitles,
  flattenOccupationTitles,
  splitOccupationCompound,
  stripOccupationClause,
} from "./occupationTitles";
import { filterOccupations, isBioNoise } from "./bioCompact";

describe("occupationTitles", () => {
  it("strips employer and explanatory clauses", () => {
    expect(stripOccupationClause("Tour Guide — I Heart PR Tours (May 2023–present)")).toBe("Tour Guide");
    expect(stripOccupationClause("Professional Photographer at Edward Thompson Media")).toBe("Photographer");
  });

  it("splits compound Grok occupation lines into short titles", () => {
    expect(extractOccupationTitles("Android developer and technical writer")).toEqual([
      "Android developer",
      "Technical writer",
    ]);
  });

  it("extracts concise titles from prose without keeping paragraphs", () => {
    const titles = extractOccupationTitles(
      "Public bio describes him as a professional model and photographer; LinkedIn lists Thompson Racing Team.",
    );
    expect(titles).toContain("Photographer");
    expect(titles).toContain("Model");
    expect(titles.some((t) => t.length > 60)).toBe(false);
  });

  it("maps racing roles to race car driver", () => {
    expect(extractOccupationTitles("Professional Driver — Thompson Racing Team")).toEqual(["Race car driver"]);
  });

  it("still excludes search queries and chat noise", () => {
    expect(extractOccupationTitles("searched for tour guide licensing")).toEqual([]);
    expect(isBioNoise("searched for Kotlin coroutines")).toBe(true);
    expect(filterOccupations(["Photographer", "searched for React patterns", "Tour guide"])).toEqual([
      "Photographer",
      "Tour guide",
    ]);
  });

  it("dedupes flattened titles", () => {
    expect(
      flattenOccupationTitles([
        "Tour guide",
        "Professional tour guide operating in Oregon",
        "Photographer",
        "photographer",
      ]),
    ).toEqual(["Tour guide", "Photographer"]);
  });

  it("splits semicolon and comma lists", () => {
    expect(splitOccupationCompound("Teacher; Photographer, Actor")).toEqual(["Teacher", "Photographer", "Actor"]);
  });
});

describe("occupationTitles from fixtures", () => {
  it("extracts roles from linkslander-style evidence prose", () => {
    const body = [
      "Tour guide with **Example Tours**",
      "Public bio also describes him as a **professional model and photographer**",
      "**Professional Driver — Example Racing Team** (since ~2013)",
    ].join("\n");
    const titles = extractOccupationTitles(body);
    expect(titles).toEqual(expect.arrayContaining(["Tour guide", "Photographer", "Model", "Race car driver"]));
  });

  it("extracts slash-separated Grok occupation compounds", () => {
    const titles = extractOccupationTitles(
      "Android developer/FOSS contributor; PR-based tour guide/business owner",
    );
    expect(titles).toEqual(
      expect.arrayContaining(["Android developer", "FOSS contributor", "Tour guide", "Business owner"]),
    );
  });

  it("extracts many concise titles from multi-career disclosure prose", () => {
    const body = [
      "Android developer/FOSS contributor; tour guide/business owner; technical writer",
      "Photography and 4K cinema; amateur radio CB/GMRS; crypto trading with Freqtrade",
      "software developer with Android (Kotlin), Python, and Three.js PWA work",
      "professional model and photographer; Professional Driver — Example Racing Team; Model Actor",
      "AI agent frameworks; Upwork freelancer audio editing",
    ].join("\n");
    const titles = extractOccupationTitles(body);
    expect(titles.length).toBeGreaterThanOrEqual(12);
    expect(titles).toEqual(
      expect.arrayContaining([
        "Android developer",
        "FOSS contributor",
        "Tour guide",
        "Business owner",
        "Technical writer",
        "Photographer",
        "Amateur radio operator",
        "Crypto developer",
        "Software developer",
        "Python developer",
        "Web developer",
        "Model",
        "Race car driver",
        "Actor",
        "AI developer",
        "Freelancer",
        "Audio editor",
      ]),
    );
    expect(titles.every((t) => t.length <= 40)).toBe(true);
  });
});
