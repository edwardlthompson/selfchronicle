import { describe, expect, it } from "vitest";
import { listChapters } from "./index";
describe("chapters", () => { it("lists eras", () => { expect(listChapters().length).toBe(1); }); });
