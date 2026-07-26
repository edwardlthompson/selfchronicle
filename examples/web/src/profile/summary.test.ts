import { beforeEach, describe, expect, it } from "vitest";
import {
  editStandout,
  emptySummary,
  getSummary,
  pinStandout,
  rebuildSummary,
  saveSummary,
  type StandoutCard,
} from "./summary";

function card(id: string, insight: string): StandoutCard {
  return {
    id,
    label: id,
    insight,
    layerSource: "facts",
    evidenceIds: [],
    factIds: [],
    pinned: false,
    provisional: true,
    user_edited: false,
  };
}

describe("profile summary", () => {
  beforeEach(() => localStorage.clear());

  it("rebuild keeps user edits and pins; drops forgotten", () => {
    let s = emptySummary();
    s = {
      ...s,
      standouts: [
        { ...card("a", "Original A"), user_edited: true, insight: "My edit" },
        { ...card("b", "B"), pinned: true },
        card("c", "C"),
      ],
    };
    saveSummary(s);
    const rebuilt = rebuildSummary(
      getSummary(),
      [
        card("a", "Compiler overwrite A"),
        card("b", "Compiler overwrite B"),
        card("c", "Compiler C"),
        card("d", "New D"),
        card("gone", "Should vanish"),
      ],
      new Set(["gone", "c"]),
    );
    expect(rebuilt.standouts.find((x) => x.id === "a")?.insight).toBe("My edit");
    expect(rebuilt.standouts.find((x) => x.id === "b")?.pinned).toBe(true);
    expect(rebuilt.standouts.find((x) => x.id === "b")?.insight).toBe("B");
    expect(rebuilt.standouts.some((x) => x.id === "c")).toBe(false);
    expect(rebuilt.standouts.some((x) => x.id === "gone")).toBe(false);
    expect(rebuilt.standouts.some((x) => x.id === "d")).toBe(true);
  });

  it("pin and edit mark user_edited", () => {
    let s = { ...emptySummary(), standouts: [card("x", "X")] };
    s = pinStandout(s, "x");
    s = editStandout(s, "x", { insight: "Edited" });
    expect(s.standouts[0]?.pinned).toBe(true);
    expect(s.standouts[0]?.user_edited).toBe(true);
    expect(s.standouts[0]?.insight).toBe("Edited");
  });
});
