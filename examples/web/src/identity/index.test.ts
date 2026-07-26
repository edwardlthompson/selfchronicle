import { describe, expect, it } from "vitest";
import { defaultIdentity } from "./index";
describe("identity", () => { it("defaults", () => { expect(defaultIdentity().label).toBe("Maker"); }); });
