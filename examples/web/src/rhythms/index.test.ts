import { describe, expect, it } from "vitest";
import { softRhythms } from "./index";
describe("rhythms", () => { it("needs confirm", () => { expect(softRhythms()[0].confirmed).toBe(false); }); });
