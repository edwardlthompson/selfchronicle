# Agent Memory

> Centralized index of tech stack, threat models, persistent context, and retrospectives.
> Update only at session startups, milestone boundaries, or major architectural pivots.

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Platform | Web/PWA + Node MCP | template 0.17.0 | Child of agent-project-bootstrap |
| Web | Vite + TypeScript + Vitest + Playwright | `examples/web` | Package `selfchronicle-web` |
| Node | Hono + Vitest | `examples/node` | Package `selfchronicle-mcp` |
| Vault | Markdown + YAML; SQLite index | planned | Files SoT (ADR-0001) |
| Sync crypto | age | planned | Ciphertext-only |
| Local crypto | libsodium + Argon2id | planned | Sensitive sections / KDF |
| License | MIT | - | Pure FOSS |
| Distribution | GitHub Releases + Pages | - | No telemetry by default |
## Active Modules

- ✅ Web / PWA (`modules/web/MODULE.md`)
- ✅ Node API / MCP (`modules/node/MODULE.md`)
- ❌ Python / Android / Rust / Go / Lightroom (pruned)

## Threat Model Checklist

- ✅ `docs/THREAT_MODEL.md` drafted for SelfChronicle
- ✅ `docs/SECURITY.md` / `docs/PRIVACY.md` product design
- ✅ No proprietary closed-source SDKs in production path
- ✅ Opt-in only telemetry (default off)
- ✅ Secrets excluded from VCS (Gitleaks pre-commit)
- ✅ Dependency vulnerability scanning enabled (CodeQL + Trivy + Dependabot)
- 🔲 Vault crypto + MCP grants implemented (later sprints)

## Persistent Context

### Project Purpose

SelfChronicle: privacy-first local memory & living biography — Evidence → Facts → Biography/Profile → LLM handoff/MCP, with Companion Trust and provisional soft layers.

### Key Constraints

- Hexagonal architecture (ADR-0001)
- No silent scraping; user-initiated imports only
- MIT; telemetry **off by default**
- Max 300 lines per static data file (UI + i18n), 150 lines per pure logic file
- Trunk-based development with Conventional Commits
- Strict type safety and test coverage budgets

### Agent command bookmark

- Human cheat sheet: [`docs/help/BATCH_COMMANDS.md`](docs/help/BATCH_COMMANDS.md) — `/bootstrap`, `/build`, `/verify`, `/ship`

## Session Retrospectives

| Date | Milestone | What worked | What to improve |
|------|-----------|-------------|-----------------|
| 2026-07-26 | v0.17.0 release | Release Please PR #7 merged; IMDb fixtures + bio chips shipped | M35 HUMAN/AUTO follow-ups remain |
| 2026-07-26 | v0.1.0 release | P0–P2 sprints shipped; gates green locally; explicit-path commit | CI wait post-push; M34 HUMAN follow-ups remain |
## Template Provenance

- **Source template:** `edwardlthompson/agent-project-bootstrap`
- **Template version:** `0.17.0` (see `.template-version`; Release Please bumps on merge)
- **Child repo:** `edwardlthompson/selfchronicle`
- **Last update check:** See `.template-update.json`
