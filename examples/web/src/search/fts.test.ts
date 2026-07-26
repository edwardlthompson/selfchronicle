import { describe, expect, it, vi } from "vitest";
import { highlightQuery, searchVault } from "./fts";

describe("vault search helpers", () => {
  it("highlights query in title", () => {
    expect(highlightQuery("Maple syrup day", "maple")).toBe("«Maple» syrup day");
  });

  it("delegates to vault.search", async () => {
    const search = vi.fn().mockResolvedValue([{ id: "1", path: "a", title: "t", type: "evidence", snippet: "" }]);
    const hits = await searchVault({ search } as never, "maple");
    expect(search).toHaveBeenCalledWith("maple");
    expect(hits).toHaveLength(1);
  });
});
