# selfchronicle CLI stub

Mirrors MCP tools from the Node host (`examples/node/`) for terminal use.

See also: [`examples/cli/README.md`](../../cli/README.md) · parent [`examples/node/README.md`](../README.md)

## Intent

| MCP | CLI (planned) |
|-----|----------------|
| `GET /mcp/tools` | `selfchronicle tools list` |
| `POST /mcp/session` | `selfchronicle auth grant` |
| `POST /mcp/tools/:name` | `selfchronicle tools invoke <name>` |

Scopes: `read`, `write-evidence`. Destructive or fact proposals require `--confirm`.

Implementation lands beside the MCP host package; this folder documents the mirror contract.
