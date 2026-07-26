import { describe, expect, it } from "vitest";
import { MemoryVault } from "../vault";
import { commitDayClose, pickQuestions } from "./ritual";
import { DEFAULT_DAY_CLOSE } from "./settings";

describe("day-close ritual", () => {
  it("caps questions at 3", () => {
    const pool = [1, 2, 3, 4].map((n) => ({ id: `q${n}`, text: `Q${n}` }));
    expect(pickQuestions(pool, 3)).toHaveLength(3);
  });

  it("commits recap to Evidence as day_close", async () => {
    const vault = new MemoryVault();
    await vault.open();
    const path = await commitDayClose(
      vault,
      DEFAULT_DAY_CLOSE,
      {
        step: "done",
        questionIndex: 0,
        recap: "Grateful for quiet work",
        answers: [],
      },
      [],
    );
    expect(path).toContain("evidence/");
    const list = await vault.listEvidence();
    expect(list[0]?.frontmatter.provenance.source).toBe("day_close");
    expect(list[0]?.body).toContain("Grateful");
  });
});
