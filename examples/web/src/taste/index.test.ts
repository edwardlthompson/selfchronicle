import { describe, expect, it } from "vitest";
import { tasteAtlas } from "./index";
describe("taste", () => { it("has signature", () => { expect(tasteAtlas()[0].domain).toBe("music"); }); });
