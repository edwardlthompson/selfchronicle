import { beforeEach, describe, expect, it } from "vitest";
import {
  loadLocalePair,
  localesDiffer,
  setUiLocale,
  setVaultLocale,
} from "./locale";

describe("ui vs vault locale", () => {
  beforeEach(() => localStorage.clear());

  it("defaults both to en", () => {
    expect(loadLocalePair()).toEqual({ uiLocale: "en", vaultLocale: "en" });
    expect(localesDiffer()).toBe(false);
  });

  it("allows independent locales", () => {
    setUiLocale("en");
    setVaultLocale("es");
    expect(loadLocalePair().vaultLocale).toBe("es");
    expect(localesDiffer()).toBe(true);
  });
});
