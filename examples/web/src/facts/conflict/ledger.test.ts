import { beforeEach, describe, expect, it } from "vitest";
import { appendConflict, loadConflicts } from "./ledger";

describe("conflict ledger", () => {
  beforeEach(() => localStorage.clear());

  it("appends tradeoff records", () => {
    const r = appendConflict({
      title: "Ship vs polish",
      sides: ["Ship now", "Polish more"],
      choice: "Ship now",
      outcome: "Shipped; follow-up polish later",
    });
    expect(r.id).toMatch(/^conflict_/);
    expect(loadConflicts()).toHaveLength(1);
    expect(loadConflicts()[0]?.sides).toHaveLength(2);
  });

  it("rejects incomplete records", () => {
    expect(() =>
      appendConflict({ title: "x", sides: ["only-one"], choice: "x" }),
    ).toThrow();
  });
});
