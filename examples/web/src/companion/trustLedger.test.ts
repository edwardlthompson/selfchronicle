import { beforeEach, describe, expect, it } from "vitest";
import {
  forget,
  isForgotten,
  loadLedger,
  remember,
  respectTombstone,
  saveLedger,
  visibleEntries,
} from "./trustLedger";

describe("trust ledger", () => {
  beforeEach(() => localStorage.clear());

  it("forgets with tombstone and refuses resurrect", () => {
    let ledger = remember(loadLedger(), {
      id: "m1",
      kind: "memory",
      body: "Sensitive detail",
    });
    ledger = forget(ledger, "m1");
    saveLedger(ledger);
    expect(isForgotten(loadLedger(), "m1")).toBe(true);
    expect(respectTombstone(loadLedger(), "m1")).toBe(true);
    expect(visibleEntries(loadLedger())).toHaveLength(0);

    ledger = remember(loadLedger(), {
      id: "m1",
      kind: "memory",
      body: "Should not return",
    });
    saveLedger(ledger);
    expect(visibleEntries(loadLedger())).toHaveLength(0);
    expect(isForgotten(loadLedger(), "m1")).toBe(true);
  });
});
