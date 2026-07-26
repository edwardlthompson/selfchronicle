import { beforeEach, describe, expect, it } from "vitest";
import {
  appendActivity,
  grantMcpSession,
  loadActivity,
  loadMcpSession,
  revokeMcpSession,
} from "./session";

describe("mcp-ui session", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("grants, logs, and revokes", () => {
    const s = grantMcpSession("Cursor", ["read"]);
    expect(loadMcpSession()?.token).toBe(s.token);
    expect(loadActivity().some((e) => e.kind === "grant")).toBe(true);
    revokeMcpSession();
    expect(loadMcpSession()).toBeNull();
    appendActivity("call", "vault_search");
    expect(loadActivity().at(-1)?.detail).toBe("vault_search");
  });
});
