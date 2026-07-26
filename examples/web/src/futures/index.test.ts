import { describe, expect, it } from "vitest";
import { listLoops } from "./index";
describe("futures", () => { it("empty", () => { expect(listLoops()).toEqual([]); }); });
