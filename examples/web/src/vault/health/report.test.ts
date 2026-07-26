import { describe, expect, it } from "vitest";
import { buildHealthReport } from "./report";

describe("vault health report", () => {
  it("flags duplicates and broken provenance", () => {
    const r = buildHealthReport({
      docIds: ["a", "b", "a"],
      evidenceIds: ["e1", "e2"],
      provenanceLinks: [{ docId: "b", evidenceIds: ["e1", "missing"] }],
    });
    expect(r.duplicates).toEqual(["a"]);
    expect(r.brokenProvenance).toEqual([
      { docId: "b", missingEvidenceIds: ["missing"] },
    ]);
    expect(r.orphans).toEqual(["e2"]);
    expect(r.ok).toBe(false);
  });

  it("ok when unique and linked", () => {
    const r = buildHealthReport({
      docIds: ["f1"],
      evidenceIds: ["e1"],
      provenanceLinks: [{ docId: "f1", evidenceIds: ["e1"] }],
    });
    expect(r.ok).toBe(true);
    expect(r.orphans).toEqual([]);
  });
});
