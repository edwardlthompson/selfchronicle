import { describe, expect, it } from "vitest";
import { defaultVoice } from "./index";
describe("voice", () => { it("guide", () => { expect(defaultVoice().narrative).toContain("provisional"); }); });
