import { describe, expect, it } from "vitest";
import { ProfileVault } from "../vault";
import { acceptCandidate, buildReviewQueue, proposeFromEvidence } from "./queue";

describe("distill queue", () => {
  it("proposes provisional candidates from evidence", async () => {
    const v = new ProfileVault();
    await v.open();
    const doc = await v.appendEvidence({
      title: "Note",
      body: "I care deeply about craft and honesty in my work.",
    });
    const c = proposeFromEvidence(doc);
    expect(c?.provisional).toBe(true);
    const q = await buildReviewQueue(v);
    expect(q.length).toBeGreaterThan(0);
    const fact = await acceptCandidate(v, c!);
    expect(fact.frontmatter.type).toBe("fact");
    expect(fact.frontmatter.links.evidence).toContain(doc.frontmatter.id);
  });
});
