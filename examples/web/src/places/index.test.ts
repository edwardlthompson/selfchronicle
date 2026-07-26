import { describe, expect, it } from "vitest";
import { listPlaces } from "./index";
describe("places", () => { it("starts empty", () => { expect(listPlaces()).toEqual([]); }); });
