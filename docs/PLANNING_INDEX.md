# SelfChronicle — Planning Index

> **Status:** Planning suite index (not product code).  
> Use this page as the entry point for product design review. Implementation has not started.  
> **Build board:** [`BUILD_PLAN.md`](../BUILD_PLAN.md) — SelfChronicle Sprint 0–P2 active board.

## Core product design

| Doc | Focus |
|-----|--------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System boundaries, PWA + Node MCP, vault, sync, pipeline |
| [DATA_MODEL.md](./DATA_MODEL.md) | Layers, frontmatter schemas, SQLite as rebuildable index |
| [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) | Repo vs on-device vault layout; Golden Path migration notes |
| [IMPORT_PIPELINE.md](./IMPORT_PIPELINE.md) | User-initiated exports only; per-source guides; no silent scraping |
| [PRIVACY.md](./PRIVACY.md) | Local-first, age sync, deletion, provenance, wellbeing, Day Close |
| [SECURITY.md](./SECURITY.md) | Threat model, age + libsodium/Argon2id, MCP grants, audit log |
| [LICENSING.md](./LICENSING.md) | MIT recommendation, telemetry FOSS policy, CONTRIBUTING outline |

## UX & handoff

| Doc | Focus |
|-----|--------|
| [UX_PLAN.md](./UX_PLAN.md) | Executive UX defaults (Day Close, dashboard, Learning Mode) |
| [UX_FLOWS.md](./UX_FLOWS.md) | Detailed flows: Day Close, Profile, Learning Mode, Handoff |
| [SCREEN_INVENTORY.md](./SCREEN_INVENTORY.md) | Screens and components (planning labels) |
| [MCP_HANDOFF.md](./MCP_HANDOFF.md) | Export packs + MCP tools and permission UX |

## Decisions & related (template / later)

| Doc | Focus |
|-----|--------|
| [adr/0001-core-architecture.md](./adr/0001-core-architecture.md) | ADR stub — Hexagonal default stated in ARCHITECTURE; fill in Sprint 1 |
| [THREAT_MODEL.md](./THREAT_MODEL.md) | Template threat-model scaffolding (complement SECURITY) |
| [SECURITY_TRIAGE.md](./SECURITY_TRIAGE.md) | Process triage (not product crypto design) |
| [GITHUB_ABOUT.md](./GITHUB_ABOUT.md) | Repo about blurb |

## Locked defaults (quick reference)

| Topic | Default |
|-------|---------|
| License | MIT |
| Sync crypto | age (X25519 + ChaCha20-Poly1305) |
| Local AEAD / KDF | libsodium + Argon2id |
| Clients | Web/PWA primary; Node for MCP/tools |
| Vault SoT | Markdown + YAML; SQLite index only (rebuildable) |
| Imports | No silent scraping; official exports + paste/share |
| Day Close | Opt-in; max 3 questions; off by default |
| Telemetry | Off by default |
| Morality / cognition | Provisional layers (Sprint 12); not judgment/IQ; handoff opt-in |

## Not yet done

- Promote `examples/*` → `apps/*` when CI paths stabilize
- Root `CONTRIBUTING.md` product polish from `docs/LICENSING.md` outline
- Feature implementation (Sprint 1+ in `BUILD_PLAN.md`)

## Sprint 0

- ✅ Package rename `selfchronicle-web` / `selfchronicle-mcp`
- ✅ ADR-0001 accepted (Hexagonal)
- ✅ Product README + threat model aligned
- ✅ HUMAN Sprint 0 items automated (ADR approve, GitHub security, MIT/telemetry, batch-commands ack)
