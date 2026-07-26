# ADR-0001: Core Application Architecture (SelfChronicle)

- **Status:** Accepted
- **Date:** 2026-07-26
- **Deciders:** edwardlthompson (+ agents per BUILD_PLAN)

> Template-repo baseline ADR remains `docs/adr/0000-template-baseline.md`.

## Context

SelfChronicle is a privacy-first, local-first personal memory and living biography system. It needs:

- A durable **vault** of plain files the user can inspect outside the app
- Multiple delivery surfaces over time (PWA now; Node MCP; later Capacitor/TWA, extension)
- Strict privacy (no silent scraping; optional sync is ciphertext-only)
- Soft psychological layers that stay provisional and user-editable

## Decision

**Selected pattern:** Hexagonal (Ports & Adapters)

- **Domain core:** Evidence, Facts, Biography, Curiosity, soft profiles (Personality, Morality, Cognition, Wellbeing), provenance rules — no framework imports
- **Ports:** `vault.open/status`, `evidence.*`, `facts.*`, `biography.*`, `import.*`, `handoff.export`, `audit.*`, later MCP-facing ports
- **Adapters:** PWA UI, OPFS/filesystem, SQLite FTS index (rebuildable), age/libsodium crypto, Node MCP host, import parsers

**Source of truth:** Markdown + YAML frontmatter on disk. SQLite (and optional embeddings) are **derived indexes** only.

**Clients:** Web/PWA primary (`examples/web` → `selfchronicle-web`); Node secondary for MCP (`examples/node` → `selfchronicle-mcp`).

**Crypto defaults:** age for sync packs; libsodium + Argon2id for local sensitive sections / key derivation. See `docs/SECURITY.md`.

## Consequences

- Feature work locks port APIs before UI (BUILD_PLAN Sequential → Parallel)
- Replacing storage or adding Capacitor/TWA should not rewrite domain rules
- Import adapters are peripheral; vault write path always goes through Evidence ports + audit
- Changing this ADR later requires a new ADR and BUILD_PLAN `[HUMAN]` approval

## Alternatives Considered

| Pattern | Rejected because |
|---------|------------------|
| MVVM only | Fine for screens; weak for multi-adapter vault/MCP/sync boundary |
| Clean Architecture (full) | Heavier ceremony than needed for FOSS PWA+MCP; hexagonal ports match adapters better |
| Monolith MVC in UI | Couples vault lifetime to framework; hard to share with Node MCP |
| No structure | Violates testability and privacy boundary reviews |
