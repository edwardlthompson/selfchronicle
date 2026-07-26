# SelfChronicle — Folder Structure Proposal

> **Status:** Planning. Distinguishes **repository** (code) from **user vault** (data).  
> Bootstrap stacks kept: `examples/web` (PWA), `examples/node` (MCP/tools host).

---

## 1. Repository layout (target)

Paths marked **(now)** exist from bootstrap; **(planned)** are product structure to grow into—do not implement features yet.

```
selfchronicle/
├── AGENTS.md
├── BUILD_PLAN.md
├── LICENSE                          # MIT
├── README.md                        # product rewrite (planned)
├── docs/
│   ├── ARCHITECTURE.md              # (now) planning
│   ├── DATA_MODEL.md                # (now) planning
│   ├── PRIVACY.md                   # (now) planning
│   ├── SECURITY.md                  # (now) planning
│   ├── IMPORT_PIPELINE.md           # (now) planning
│   ├── FOLDER_STRUCTURE.md          # (now) this file
│   ├── UX_FLOWS.md                  # (now) planning
│   ├── SCREEN_INVENTORY.md          # (now) planning
│   ├── features/                    # vertical-slice specs
│   └── adr/
├── examples/
│   ├── web/                         # (now) Golden Path PWA → promote to apps/web later
│   └── node/                        # (now) Golden Path Node → MCP host later
├── packages/                        # (planned) shared libraries
│   ├── vault-core/                  # domain + ports
│   ├── importers/                   # source parsers + fixtures
│   ├── crypto/                      # age / libsodium wrappers
│   ├── search-index/                # SQLite FTS rebuild
│   └── context-packs/               # LLM pack builders
├── apps/                            # (planned) when promoting off Golden Path
│   ├── web/                         # PWA
│   ├── mcp-host/                    # local MCP
│   └── extension/                   # browser extension (later)
├── design-tokens/
├── scripts/                         # bootstrap gates
└── .cursor/                         # agent rules & commands
```

### Stack policy

| Keep | Prune (done) |
|------|----------------|
| `examples/web`, `modules/web` | android, python, rust, go, lightroom |
| `examples/node`, `modules/node` | |

Capacitor/TWA: **not** in tree until ADR.

---

## 2. User vault layout (on device)

Not committed to git. Created at runtime.

```
vault/
├── meta.yaml
├── evidence/
│   └── YYYY/MM/DD/*.md
├── facts/
├── insights/
├── personality/
│   ├── current.md
│   └── versions/
├── biography/
│   ├── _index.yaml
│   └── *.md
├── curiosity/
│   ├── queue.yaml
│   └── *.md
├── wellbeing/
├── on-this-day/                     # optional materialization
├── attachments/
│   └── aa/<sha256>.bin
├── imports/
│   └── sc_job_*/manifest.yaml
├── audit/
│   └── YYYY-MM-DD.jsonl
├── exports/
│   └── packs/
└── _index/                          # regenerable SQLite + caches
    └── vault.sqlite
```

---

## 3. Mapping: monorepo → runtime

| Concern | Code package (planned) | Runtime |
|---------|------------------------|---------|
| Parse ChatGPT zip | `packages/importers` | runs in PWA worker / node CLI |
| Read/write Markdown vault | `packages/vault-core` | OPFS or FS path |
| Encrypt sync bundle | `packages/crypto` | before network |
| MCP tools | `apps/mcp-host` | localhost / stdio |
| UI | `examples/web` → `apps/web` | browser |

---

## 4. Docs ownership

| Doc | Owner focus |
|-----|-------------|
| ARCHITECTURE.md | System boundaries |
| DATA_MODEL.md | Schemas & layers |
| PRIVACY.md | User promises |
| SECURITY.md | Threats & crypto |
| IMPORT_PIPELINE.md | Sources & guides |
| UX_FLOWS.md | Rituals & permissions UX |
| FOLDER_STRUCTURE.md | Where things live |

---

## 5. Migration from Golden Path

1. Plan & docs (current)  
2. Rename `golden-path-web` → `selfchronicle-web` in package.json (Sprint 0)  
3. Extract `vault-core` when first importer lands  
4. Promote `examples/*` → `apps/*` when CI paths stabilize  

No production feature code in this planning pass.
