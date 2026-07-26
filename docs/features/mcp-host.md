# Feature: mcp-host

Local MCP / tool host for SelfChronicle vault access with **default deny** and short-lived sessions.

## Tools (names locked)

| Tool | Tier | Notes |
|------|------|-------|
| `vault_list` | session:read | List by layer/path/date |
| `vault_read` | session:read | Markdown + frontmatter |
| `vault_search` | session:read | FTS over authorized layers |
| `get_profile_summary` | session:read | Compact abstract |
| `get_on_this_day` | session:read | Date cards |
| `get_curiosity_open` | session:read | Open Curiosity items |
| `append_evidence` | session:write-evidence | Preferred write |
| `propose_fact` | action:confirm | Never silent publish |
| `export_handoff` | session:read | Pack generation |

Out of scope: IDE scrape, bulk delete without confirm, encrypted cloud without unlock.

## Cursor / Claude Code how-to

1. Run `examples/node` (`npm start`) — HTTP tool host on `PORT` (default 3000).
2. Grant a session: `POST /mcp/session` with scopes `read` and optionally `write-evidence`.
3. Call tools via `POST /mcp/tools/:name` with `Authorization: Bearer <token>`.
4. Revoke: `DELETE /mcp/session` — activity log records grant/revoke/calls.
5. Prefer minimal scopes; revoke when done. Writes that need `action:confirm` return `needs_confirm` until approved.

## Activity log

Every grant, revoke, tool call, and confirm decision is appended to the MCP activity log (surfaced in web `mcp-ui`).
