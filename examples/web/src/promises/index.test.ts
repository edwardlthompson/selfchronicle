import { describe, expect, it } from "vitest";
import { listPromises } from "./index";
describe("promises", () => { it("empty", () => { expect(listPromises()).toEqual([]); }); });
