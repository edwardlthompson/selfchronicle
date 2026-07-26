import { describe, expect, it } from "vitest";
import { monthDayKey } from "./layers";
import { ProfileVault } from "./profileVault";
import { vaultListAllDocs, vaultOnThisDay } from "./profileVaultQueries";
import { getStoredIdentity } from "../profile/identityVault";
import { saveBioFromForm } from "../profile/bioVault";

describe("ProfileVault", () => {
  it("stores facts and biography chapters", async () => {
    const v = new ProfileVault();
    await v.open();
    await v.upsertLayer("facts", "Loves maple trees", "User noted maple often.", []);
    await v.upsertLayer("biography", "Chapter 1", "Once upon a quiet day.", []);
    expect(await v.listLayer("facts")).toHaveLength(1);
    expect(await v.listLayer("biography")).toHaveLength(1);
    expect((await vaultListAllDocs(v)).length).toBeGreaterThanOrEqual(2);
  });

  it("filters On This Day by month-day", async () => {
    expect(monthDayKey("2020-07-26T12:00:00Z")).toBe("07-26");
    const v = new ProfileVault();
    await v.open();
    await v.appendEvidence({ title: "Old note", body: "years ago" });
    const hits = await vaultOnThisDay(v, new Date());
    expect(Array.isArray(hits)).toBe(true);
  });

  it("persists identity in vault layers", async () => {
    const v = new ProfileVault({ persist: false });
    await v.open();
    await saveBioFromForm(v, {
      displayName: "Alex",
      preferredName: "",
      dateOfBirth: "1990-01-01",
      age: null,
      homeAddress: "Portland",
      email: "",
      phone: "",
      links: [],
      occupations: ["Teacher"],
      languages: [],
      user_edited: true,
      updated_at: null,
    });
    const stored = await getStoredIdentity(v);
    expect(stored?.displayName).toBe("Alex");
    expect(stored?.occupations).toEqual(["Teacher"]);
  });
});
