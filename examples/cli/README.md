# selfchronicle CLI (stub)

Thin CLI mirror of the local MCP tool host.

- Primary MCP host: [`examples/node/`](../node/) (`selfchronicle-mcp`)
- CLI package stub: [`examples/node/cli/`](../node/cli/)
- Specs: `docs/features/mcp-host.md`, `docs/MCP_HANDOFF.md`

```bash
# Planned entry (Sprint 11 stub):
# npx selfchronicle tools list
# npx selfchronicle tools invoke <name> --confirm
```

All vault reads/writes require explicit user permission scopes, same as MCP.
