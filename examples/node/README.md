# SelfChronicle MCP host (Node)

Local Node (Hono) host for MCP / CLI tools that read and write the vault **with user permission**.

## Scripts

```bash
npm ci
npm run dev
npm test

```

## Role

- Local MCP-style tool host (`docs/features/mcp-host.md`, `docs/MCP_HANDOFF.md`)
- CLI mirror (`selfchronicle`) planned in Sprint 11

Package name: `selfchronicle-mcp`.

## MCP HTTP API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/mcp/tools` | List tool names |
| POST | `/mcp/session` | Grant `{ client, scopes }` → token |
| DELETE | `/mcp/session` | Revoke `Authorization: Bearer <token>` |
| POST | `/mcp/tools/:name` | Invoke tool with bearer token |
| GET | `/mcp/activity` | Activity log |
Scopes: `read`, `write-evidence`. `propose_fact` requires `{ confirm: true }`.
