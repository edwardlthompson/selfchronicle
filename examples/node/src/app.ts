import { Hono } from "hono";

import { greet } from "./greet.js";
import { mountMcp } from "./mcp/routes.js";

export function createApp() {
  const app = new Hono();

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.get("/greet/:name?", (c) => {
    const name = c.req.param("name") ?? "";
    return c.json({ message: greet(name) });
  });

  mountMcp(app);
  return app;
}
