import { describe, expect, it } from "vitest";
import { ProfileVault } from "../vault";
import { buildHandoffPack } from "./buildPack";

describe("buildHandoffPack", () => {
  it("excludes wellbeing by default and includes facts", async () => {
    const v = new ProfileVault();
    await v.open();
    await v.upsertLayer("facts", "Loves maps", "Cartography joy");
    const pack = await buildHandoffPack(v);
    expect(pack.handoffMd).toContain("wellbeing_included: false");
    expect(pack.handoffMd).toContain("Loves maps");
    expect(pack.handoffMd).toContain("provisional");
    expect(pack.handoffMd).toContain("not clinical diagnoses");
  });
});
