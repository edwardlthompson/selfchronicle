import { beforeEach, describe, expect, it } from "vitest";
import { loadPrinciples, savePrinciples } from "./principles";

describe("values principles", () => {
  beforeEach(() => localStorage.clear());

  it("loads empty default", () => {
    const d = loadPrinciples();
    expect(d.body).toBe("");
    expect(d.userEdited).toBe(false);
  });

  it("persists user-written principles", () => {
    savePrinciples({
      title: "My values",
      body: "Own the narrative.",
      updatedAt: "",
      userEdited: false,
    });
    const d = loadPrinciples();
    expect(d.title).toBe("My values");
    expect(d.body).toBe("Own the narrative.");
    expect(d.userEdited).toBe(true);
    expect(d.updatedAt).not.toBe("");
  });
});
