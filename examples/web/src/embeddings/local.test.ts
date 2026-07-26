import { describe, expect, it } from "vitest";
import { embedStub } from "./local";

describe("local embeddings", () => {
  it("stays localOnly", () => {
    expect(embedStub("hello vault").localOnly).toBe(true);
  });
});
