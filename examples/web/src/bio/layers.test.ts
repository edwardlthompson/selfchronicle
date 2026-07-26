import { beforeEach, describe, expect, it } from "vitest";
import {
  addChapter,
  addTaste,
  addTurningPoint,
  loadLayers,
  saveLayers,
  stubLayers,
} from "./layers";

describe("biographical layers", () => {
  beforeEach(() => localStorage.clear());

  it("provides chapter, turning_point, and taste_atlas stubs", () => {
    const s = stubLayers();
    expect(s.chapters[0]?.id).toBeTruthy();
    expect(s.turning_points[0]?.label).toBeTruthy();
    expect(s.taste_atlas[0]?.domain).toBe("music");
  });

  it("persists additions", () => {
    let layers = loadLayers();
    layers = addChapter(layers, {
      id: "ch_2",
      title: "Now",
      era: "present",
      body: "Living chapter",
      privateDefault: false,
    });
    layers = addTurningPoint(layers, {
      id: "tp_2",
      label: "Moved cities",
      when: "2020",
      evidenceIds: ["ev_1"],
      factIds: [],
    });
    layers = addTaste(layers, {
      id: "taste_2",
      domain: "food",
      signature: "Spicy + shared plates",
    });
    saveLayers(layers);
    const loaded = loadLayers();
    expect(loaded.chapters.some((c) => c.id === "ch_2")).toBe(true);
    expect(loaded.turning_points.some((t) => t.id === "tp_2")).toBe(true);
    expect(loaded.taste_atlas.some((t) => t.id === "taste_2")).toBe(true);
  });
});
