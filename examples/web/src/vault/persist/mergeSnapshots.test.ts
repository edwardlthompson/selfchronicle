import { describe, expect, it } from "vitest";
import { mergeSnapshots } from "./mergeSnapshots";
import { emptySnapshot } from "./types";

const md = (id: string, title: string, updated: string, body = "body") =>
  `---\nid: ${id}\ntype: evidence\ntitle: ${title}\ncreated_at: 2026-01-01T00:00:00Z\nupdated_at: ${updated}\ningested_at: 2026-01-01T00:00:00Z\ntags: []\nstatus: active\nuser_edited: true\nprovenance:\n  source: manual\nlinks:\n  evidence: []\n  facts: []\n  attachments: []\n---\n\n${body}`;

describe("mergeSnapshots", () => {
  it("unions unique paths from both sides", () => {
    const local = {
      ...emptySnapshot(),
      files: {
        "evidence/a.md": md("sc_ev_a", "Local only", "2026-01-02T00:00:00Z"),
      },
    };
    const remote = {
      ...emptySnapshot(),
      files: {
        "evidence/b.md": md("sc_ev_b", "Remote only", "2026-01-02T00:00:00Z"),
      },
    };
    const merged = mergeSnapshots(local, remote);
    expect(Object.keys(merged.files)).toHaveLength(2);
    expect(merged.files["evidence/a.md"]).toContain("Local only");
    expect(merged.files["evidence/b.md"]).toContain("Remote only");
  });

  it("keeps newer updated_at when same path conflicts", () => {
    const local = {
      ...emptySnapshot(),
      files: {
        "evidence/x.md": md("sc_ev_x", "Old title", "2026-01-01T00:00:00Z"),
      },
    };
    const remote = {
      ...emptySnapshot(),
      files: {
        "evidence/x.md": md("sc_ev_x", "New title", "2026-01-10T00:00:00Z"),
      },
    };
    const merged = mergeSnapshots(local, remote);
    expect(merged.files["evidence/x.md"]).toContain("New title");
  });

  it("never drops items silently — union is additive", () => {
    const a = {
      ...emptySnapshot(),
      files: { "evidence/1.md": md("sc_ev_1", "Grok", "2026-01-05T00:00:00Z") },
      layers: { "facts/grok.md": md("sc_fa_1", "Grok fact", "2026-01-05T00:00:00Z") },
    };
    const b = {
      ...emptySnapshot(),
      files: { "evidence/2.md": md("sc_ev_2", "ChatGPT", "2026-01-06T00:00:00Z") },
      layers: { "facts/chat.md": md("sc_fa_2", "Chat fact", "2026-01-06T00:00:00Z") },
    };
    const merged = mergeSnapshots(a, b);
    expect(Object.keys(merged.files)).toHaveLength(2);
    expect(Object.keys(merged.layers)).toHaveLength(2);
  });
});
