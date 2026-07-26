import { describe, expect, it } from "vitest";
import { parseObsidianFrontmatter, toSelfChronicleTags } from "./obsidian";

describe("obsidian compat", () => {
  it("parses tags and aliases", () => {
    const md = `---
title: Note
tags: [work, life]
aliases: [n1]
created: 2025-01-01
---
Body text
`;
    const { data, body } = parseObsidianFrontmatter(md);
    expect(data.title).toBe("Note");
    expect(data.tags).toEqual(["work", "life"]);
    expect(data.aliases).toEqual(["n1"]);
    expect(body.trim()).toBe("Body text");
    expect(toSelfChronicleTags(data)).toContain("alias:n1");
  });

  it("handles markdown without frontmatter", () => {
    const { data, body } = parseObsidianFrontmatter("plain");
    expect(data.tags).toEqual([]);
    expect(body).toBe("plain");
  });
});
