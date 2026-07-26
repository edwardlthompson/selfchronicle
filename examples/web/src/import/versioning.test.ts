import { describe, expect, it } from "vitest";
import { collectUnknown, makeSidecar } from "./versioning";

describe("import versioning", () => {
  it("parks unknown fields in sidecar", () => {
    const side = makeSidecar("demo_v1", { title: "a", weird: 1 }, ["title"]);
    expect(side.unknown_fields).toEqual({ weird: 1 });
    expect(collectUnknown({ a: 1, b: 2 }, ["a"])).toEqual({ b: 2 });
  });
});
