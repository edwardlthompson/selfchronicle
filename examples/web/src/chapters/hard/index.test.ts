import { describe, expect, it } from "vitest";
import { HARD_CHAPTER_PRIVATE, hardChapterNote } from "./index";
describe("hard chapters", () => {
  it("private default", () => {
    expect(HARD_CHAPTER_PRIVATE).toBe(true);
    expect(hardChapterNote()).toMatch(/private/i);
  });
});
