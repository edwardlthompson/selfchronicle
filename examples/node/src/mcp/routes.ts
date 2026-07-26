import type { Hono } from "hono";
import { createSessionStore, type McpScope } from "./session.js";
import { TOOL_NAMES, invokeTool } from "./tools.js";
import { createMemoryVault } from "./vaultMemory.js";

export function mountMcp(app: Hono): void {
  const sessions = createSessionStore();
  const vault = createMemoryVault([
    {
      id: "ev_demo",
      path: "evidence/2026-07-26/ev_demo.md",
      type: "evidence",
      title: "Demo note",
      body: "A local-first memory.",
      created_at: "2026-07-26T12:00:00Z",
    },
  ]);

  app.get("/mcp/tools", (c) => c.json({ tools: TOOL_NAMES }));

  app.post("/mcp/session", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      client?: string;
      scopes?: McpScope[];
    };
    const scopes = body.scopes?.length ? body.scopes : (["read"] as McpScope[]);
    const session = sessions.grant(body.client ?? "cursor", scopes);
    return c.json(session);
  });

  app.delete("/mcp/session", async (c) => {
    const auth = c.req.header("authorization") ?? "";
    const token = auth.replace(/^Bearer\s+/i, "");
    const ok = sessions.revoke(token);
    return c.json({ revoked: ok });
  });

  app.get("/mcp/activity", (c) => c.json({ log: sessions.log }));

  app.post("/mcp/tools/:name", async (c) => {
    const name = c.req.param("name");
    const auth = c.req.header("authorization") ?? "";
    const token = auth.replace(/^Bearer\s+/i, "") || undefined;
    const args = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const result = invokeTool(name, args, token, sessions, vault);
    return c.json(result, result.ok ? 200 : result.error === "unauthorized" ? 401 : 400);
  });
}
