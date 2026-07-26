import { describe, expect, it } from "vitest";
import type { CuriosityItem } from "../curiosity";
import {
  MAX_MORALITY_QUESTIONS,
  answerQuestion,
  currentQuestion,
  moralityCap,
  skipQuestion,
  startG2kSession,
} from "./session";

function item(
  id: string,
  tags: string[],
  priority: number,
  status: CuriosityItem["status"] = "open",
): CuriosityItem {
  return { id, question: `Q ${id}`, tags, priority, status };
}

describe("getting-to-know-you session", () => {
  it("caps morality questions at 3 and supports skip", () => {
    const pool = [
      item("a", ["morality"], 1),
      item("b", ["getting_to_know_you"], 2),
      item("c", ["morality", "deep"], 3),
      item("d", ["morality"], 4),
      item("e", ["evening"], 1),
    ];
    let s = startG2kSession(pool);
    expect(s.asked).toHaveLength(MAX_MORALITY_QUESTIONS);
    expect(moralityCap(s)).toBe(3);
    expect(currentQuestion(s)?.id).toBe("a");
    s = skipQuestion(s, "a");
    expect(s.skippedIds).toContain("a");
    expect(currentQuestion(s)?.id).toBe("b");
    s = answerQuestion(s, "b");
    s = skipQuestion(s, "c");
    expect(s.done).toBe(true);
  });
});
