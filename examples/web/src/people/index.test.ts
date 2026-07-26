import { beforeEach, describe, expect, it } from "vitest";
import { addPerson, assertNoDeviceContacts, loadPeople, savePeople } from "./index";

describe("people index", () => {
  beforeEach(() => localStorage.clear());

  it("starts empty and stores curated entries", () => {
    expect(loadPeople()).toEqual([]);
    const p = addPerson("Alex", "colleague", ["work"]);
    expect(p.displayName).toBe("Alex");
    expect(loadPeople()).toHaveLength(1);
  });

  it("round-trips via savePeople", () => {
    savePeople([{ id: "p1", displayName: "Sam", notes: "", tags: [] }]);
    expect(loadPeople()[0]?.displayName).toBe("Sam");
  });

  it("never uses navigator.contacts or Contacts API", () => {
    assertNoDeviceContacts();
  });
});
