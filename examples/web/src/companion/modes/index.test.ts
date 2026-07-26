import { describe, expect, it } from "vitest";
import { listModes } from "./index";
describe("modes", () => { it("lists six", () => { expect(listModes()).toHaveLength(6); }); });
