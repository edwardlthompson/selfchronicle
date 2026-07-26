import { describe, expect, it } from "vitest";
import type { VaultDocument } from "../vault";
import { buildStatStory, buildTimeline } from "./build";

function doc(id: string, type: string, created: string, title: string): VaultDocument {
  return {
    path: `${type}/${id}.md`,
    body: title,
    frontmatter: {
      id,
      type: type as VaultDocument["frontmatter"]["type"],
      title,
      created_at: created,
      updated_at: created,
      ingested_at: created,
      tags: [],
      status: "active",
      user_edited: true,
      provenance: { source: "manual" },
      links: { evidence: [], facts: [], attachments: [] },
    },
  };
}

describe("timeline", () => {
  it("orders nodes by created_at", () => {
    const nodes = buildTimeline([
      doc("b", "fact", "2026-07-02T00:00:00Z", "Later"),
      doc("a", "evidence", "2026-07-01T00:00:00Z", "Earlier"), // chronological
    ]);
    expect(nodes.map((n) => n.id)).toEqual(["a", "b"]);
  });

  it("stat story avoids shame language", () => {
    const story = buildStatStory([doc("a", "evidence", "2026-07-01T00:00:00Z", "Note")]);
    expect(story.toLowerCase()).not.toMatch(/missed|streak|fail|shame|\bscore\b/);
    expect(story).toContain("calm record");
  });
});
