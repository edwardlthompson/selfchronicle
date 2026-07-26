# Feature: vault-core

> Sprint 1 — Vault foundation. Markers: 🔲 open · ✅ done · ❌ blocked.

## Acceptance criteria

- ✅ Open vault and report status (root label, schema version, evidence count)
- ✅ Append Evidence as Markdown + YAML frontmatter with stable `sc_ev_*` ids
- ✅ List Evidence and get-by-id
- ✅ Rebuildable search index (in-memory adapter; SQLite WASM later via same port)
- ✅ Offline-first: MemoryVault works without network
- ✅ Unit tests cover frontmatter round-trip + vault happy path
- 🔲 OPFS / filesystem adapter (follow-up)
- 🔲 Accessibility of vault path hints in UI (shell sprint)

## Smoke scenario

1. _Given_ app bootstraps with MemoryVault
2. _When_ user (or test) appends one Evidence note
3. _Then_ note appears in list/search and survives index rebuild

## Container map

| Layer | Path |
|-------|------|
| Logic | `examples/web/src/vault/` |
| View | `examples/web/src/shell/` (nav + Today stub) |
| Tests | `examples/web/src/vault/*.test.ts` |
| Wiring | `appBootstrap.ts` ≤10 new lines |

## Definition of Done

- Ports locked in `vault/ports.ts` + types from `docs/DATA_MODEL.md`
- `MemoryVault` implements `VaultPort`
- feature-gate / unit tests green

## Notes

- Hexagonal: domain types have no UI imports
- Files remain source of truth; index is derived
