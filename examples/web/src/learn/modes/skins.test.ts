import { describe, expect, it } from "vitest";
import { applySkinPrompt, getSkin, listSkins } from "./skins";

describe("session skins", () => {
  it("exposes Witness and Encourage with AI-honest hints", () => {
    const skins = listSkins();
    expect(skins.map((s) => s.id)).toEqual(["witness", "encourage"]);
    expect(getSkin("witness").allowsSkip).toBe(true);
    expect(getSkin("encourage").companionHint.toLowerCase()).toContain("ai");
    expect(getSkin("witness").companionHint.toLowerCase()).toContain("ai");
    const prompt = applySkinPrompt(getSkin("encourage"), "What went well?");
    expect(prompt).toContain("Encourage");
    expect(prompt).toContain("What went well?");
    expect(prompt.toLowerCase()).not.toContain("lonely");
  });
});
