import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_LAYER_OPT_IN,
  includedLayers,
  isExcludedByDefault,
  loadOptIn,
  saveOptIn,
  setLayerOptIn,
} from "./optIn";

describe("handoff layer opt-in", () => {
  beforeEach(() => localStorage.clear());

  it("defaults morality and cognition off", () => {
    expect(DEFAULT_LAYER_OPT_IN.morality).toBe(false);
    expect(DEFAULT_LAYER_OPT_IN.cognition).toBe(false);
    expect(isExcludedByDefault("morality")).toBe(true);
    expect(isExcludedByDefault("cognition")).toBe(true);
    expect(includedLayers(loadOptIn())).toEqual([]);
  });

  it("includes a layer only after explicit opt-in", () => {
    let opt = loadOptIn();
    opt = setLayerOptIn(opt, "morality", true);
    saveOptIn(opt);
    expect(loadOptIn().morality).toBe(true);
    expect(loadOptIn().cognition).toBe(false);
    expect(includedLayers(loadOptIn())).toEqual(["morality"]);
  });
});
