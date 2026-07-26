# SelfChronicle — Data Model

> **Status:** Planning document (logical model).  
> Prefer **Markdown + YAML frontmatter**. Use SQLite / embeddings only as rebuildable indexes.  
> **Related:** [ARCHITECTURE.md](./ARCHITECTURE.md), [PRIVACY.md](./PRIVACY.md), [IMPORT_PIPELINE.md](./IMPORT_PIPELINE.md)

---

## 1. Design rules

1. **Files are truth** — if SQLite burns, vault regenerates indexes.  
2. **Every item has provenance** — source, timestamps, import job or `manual`.  
3. **Soft layers are provisional** — personality, insights, wellbeing carry `status` and disclaimers.  
4. **User edits win** — `user_edited: true` prevents silent overwrite on recompile (unless user opts into “rebuild section”).  
5. **IDs are stable** — `sc_<type>_<ulid>` (or UUIDv7) in frontmatter.  
6. **UTC internally** — display in local TZ.

---

## 2. Layer map

| Layer | Path | Primary format | Structured index? |
|-------|------|----------------|-------------------|
| Evidence | `vault/evidence/` | `.md` + frontmatter | Yes (search, dates) |
| Facts | `vault/facts/` | `.md` or `.yaml` | Yes |
| Insights | `vault/insights/` | `.md` | Optional |
| Personality | `vault/personality/` | versioned `.md` | Light |
| Living Biography | `vault/biography/` | chapter `.md` | Light |
| Curiosity File | `vault/curiosity/` | `.md` / queue.yaml | Yes (priority) |
| Wellbeing Signals | `vault/wellbeing/` | `.yaml` / `.md` | Optional |
| Morality / values matrix | `vault/morality/` | `.md` / `.yaml` | Light (provisional) |
| Cognition / attention | `vault/cognition/` | `.yaml` / `.md` | Light (provisional; bands only) |
| Profile Summary | `vault/profile/summary.md` | Markdown + YAML | Light |
| Relationship charter | `vault/profile/charter.md` | Markdown | Light |
| Biographical depth | `vault/biography/` + bio subtypes | chapters, turning points, taste | Light |
| On This Day | derived + `vault/on-this-day/` | keys → id lists | Yes (required for perf) |
| Attachments | `vault/attachments/` | binary + sidecar yaml | Hash index |
| Import jobs | `vault/imports/` | job manifests | Yes |
| Audit | `vault/audit/` | append JSONL/md | Optional |
| Trust ledger | `vault/trust/` | forget/tombstone log | Optional |

---

## 3. Common frontmatter

```yaml
id: sc_ev_01hexample000000000000000
type: evidence            # evidence | fact | insight | biography_chapter | curiosity | wellbeing | personality
title: Short label
created_at: 2026-07-26T01:00:00Z
updated_at: 2026-07-26T01:00:00Z
ingested_at: 2026-07-26T01:00:00Z
tags: [work, family]
status: active            # active | archived | deleted_tombstone
user_edited: false
provenance:
  source: chatgpt_export  # see source enum
  source_id: conv_abc123  # id in origin system if known
  import_job_id: sc_job_01h...
  transformer: chatgpt_v1
  confidence: 0.8         # 0-1; user-facing labels map from this
links:
  evidence: []            # ids
  facts: []
  attachments: []
```

### Source enum (initial)

`manual`, `manual_paste`, `share_target`, `day_close`, `mcp`, `grok_export`, `chatgpt_export`, `claude_export`, `gemini_export`, `gmail_takeout`, `mbox`, `whatsapp_export`, `meta_dyi`, `facebook_export`, `instagram_export`, `other_archive`

---

## 4. Evidence layer

Raw imported items and primary notes. **Do not silently rewrite** body text after commit; corrections are new edits or linked facts.

### 4.1 File shape

`vault/evidence/2026/07/26/sc_ev_….md`

```yaml
---
id: sc_ev_01h...
type: evidence
title: "Chat with Grok about career plans"
occurred_at: 2026-07-20T18:22:00Z   # best-effort event time
ingested_at: 2026-07-26T01:10:00Z
provenance:
  source: grok_export
  source_id: "conversation-uuid"
  import_job_id: sc_job_01h...
mime_hint: text/markdown
participants: [user, grok]
channel: llm_chat
privacy:
  contains_third_parties: true
---

## Message 1 — user — 2026-07-20T18:22:00Z

...

## Message 2 — assistant — 2026-07-20T18:22:30Z

...
```

### 4.2 Evidence kinds

| `channel` | Examples |
|-----------|----------|
| `llm_chat` | Grok, ChatGPT, Claude, Gemini |
| `email` | Gmail / MBOX messages |
| `messaging` | WhatsApp, Meta threads |
| `social` | Facebook/Instagram posts/comments |
| `code` | Optional git notes (future) |
| `journal` | Day Close, manual journal |
| `other` | Catch-all |

### 4.3 Staging vs committed

- `vault/imports/<job_id>/raw/` — optional retained originals (zip/json)
- `vault/imports/<job_id>/manifest.yaml` — parser version, counts, errors
- Commit copies normalized Markdown into `evidence/`

---

## 5. Facts / Insights layer

### 5.1 Fact

Durable, atomic claim. Prefer one claim per file.

```yaml
---
id: sc_fa_01h...
type: fact
title: Lives in Austin
claim: "User lives in Austin, Texas"
claim_kind: residence          # person | place | preference | event | relationship | skill | other
status: confirmed              # inferred | confirmed | disputed | retracted
user_edited: true
occurred_on: 2024-05-01        # optional date or range
provenance:
  source: chatgpt_export
  import_job_id: sc_job_01h...
links:
  evidence: [sc_ev_01h...]
confidence: 0.9
---

Supporting note (optional narrative).
```

### 5.2 Insight

Softer pattern across multiple facts/evidence. Always provisional.

```yaml
---
id: sc_in_01h...
type: insight
title: Prefers deep work in mornings
status: provisional            # provisional | accepted | rejected
links:
  facts: [sc_fa_...]
  evidence: [sc_ev_...]
disclaimer: soft_pattern
---
```

---

## 6. Personality & psychological profile

Synthesized, **versioned**, fully user-editable. Not a clinical instrument.

```
vault/personality/
  current.md              # symlink or pointer in meta
  versions/
    2026-07-26_v3.md
```

```yaml
---
id: sc_pe_01h...
type: personality
version: 3
status: provisional
user_edited: false
compiled_at: 2026-07-26T02:00:00Z
compiler: local_v1
sections:
  - values
  - communication_style
  - interests
  - working_style
  - relationships_notes
disclaimer: not_diagnosis
links:
  facts: []
  insights: []
---

# Personality profile (v3)

## Values
...
```

**Rules:**

- Recompile creates a new version; never clobber `user_edited: true` without prompt
- UI shows “provisional / editable” badge
- Exportable as part of LLM profile packs

---

## 7. Living Biography

Compiled narrative chapters the user can edit freely.

```
vault/biography/
  _index.yaml             # chapter order
  01-origins.md
  02-work.md
  ...
```

```yaml
---
id: sc_bi_01h...
type: biography_chapter
title: Work and craft
slug: work
order: 2
status: active
user_edited: true
frozen: false             # if true, compile skips this chapter
compiled_at: 2026-07-01T00:00:00Z
links:
  evidence: []
  facts: []
---

# Work and craft

Narrative prose...
```

`_index.yaml`:

```yaml
chapters:
  - id: sc_bi_01h...
    path: 01-origins.md
  - id: sc_bi_01h2...
    path: 02-work.md
updated_at: 2026-07-26T02:00:00Z
```

---

## 8. Curiosity File

Prioritized questions SelfChronicle (or the user) may ask later—including Day Close.

```yaml
---
id: sc_cu_01h...
type: curiosity
title: What drew you to music as a kid?
priority: 10              # higher = sooner
status: open              # open | snoozed | answered | dismissed
ask_after: 2026-08-01
source: gap_detection
links:
  evidence: []
---

Context for why this question exists.
```

Queue helper: `vault/curiosity/queue.yaml` listing open IDs by priority (regenerable).

**Day Close** may pull at most **3** open curiosity items when the ritual is opted in.

---

## 9. Wellbeing Signals

Soft, provisional indicators with **mandatory disclaimer** metadata.

```yaml
---
id: sc_wb_01h...
type: wellbeing
title: Energy
signal_key: energy
value: medium             # freeform or small enum; user-editable
status: provisional
enabled: true
user_edited: false
disclaimer: |
  Optional reflection from your notes. Not medical or psychological diagnosis.
  You can edit or turn this off anytime.
links:
  evidence: []
observed_window:
  start: 2026-07-01
  end: 2026-07-26
---
```

Global kill switch in `vault/meta.yaml`:

```yaml
wellbeing:
  enabled: false          # default off until user opts in
```

---

## 10. On This Day index

Performance structure keyed by `MM-DD` and optional year.

**Derived table (SQLite):**

| Column | Type | Notes |
|--------|------|-------|
| day_key | TEXT | `07-26` |
| year | INT | nullable for recurring |
| item_id | TEXT | evidence/fact/bio id |
| item_type | TEXT | |
| title | TEXT | |
| occurred_at | TEXT | ISO |

Optional materialization files for portability:

`vault/on-this-day/07-26.yaml` → list of ids (optional; SQLite preferred at runtime).

---

## 11. Attachments

```
vault/attachments/
  ab/ab12cd...sha256.bin
  ab/ab12cd...sha256.yaml
```

```yaml
id: sc_at_01h...
sha256: ab12cd...
filename_original: photo.jpg
mime: image/jpeg
bytes: 204800
created_at: 2026-07-26T01:00:00Z
links:
  evidence: [sc_ev_...]
```

Prefer content-addressed storage; encrypt at rest when vault lock enabled ([SECURITY.md](./SECURITY.md)).

---

## 12. Import job manifest

`vault/imports/sc_job_01h.../manifest.yaml`

```yaml
id: sc_job_01h...
source: grok_export
parser: grok_json_v1
started_at: 2026-07-26T01:00:00Z
finished_at: 2026-07-26T01:05:00Z
status: committed         # staging | reviewing | committed | failed | cancelled
files:
  - name: prod-grok-backend.json
    sha256: ...
counts:
  evidence_created: 42
  skipped: 3
  errors: 0
user_choices:
  retain_raw: false
  date_range: null
```

---

## 13. Audit events

`vault/audit/2026-07-26.jsonl` (one JSON object per line):

```json
{"at":"2026-07-26T01:05:00Z","actor":"user","action":"import.commit","job_id":"sc_job_01h...","details":{"evidence":42}}
```

Actions (initial): `vault.create`, `import.*`, `fact.*`, `biography.compile`, `biography.edit`, `wellbeing.*`, `sync.*`, `mcp.grant`, `mcp.invoke`, `export.*`, `vault.delete`

Users may purge audit (privacy control) with warning.

---

## 14. LLM context packs (derived)

Not a durable layer—build artifacts under `vault/exports/packs/`:

```yaml
id: sc_pk_01h...
created_at: 2026-07-26T03:00:00Z
include:
  biography_chapters: [work, values]
  facts: { tags: [preferences], status: confirmed, limit: 50 }
  personality: current
exclude:
  wellbeing: true
  evidence_raw: true
```

Pack body is Markdown suitable for paste into any LLM.

---

## 15. SQLite index (regenerable)

Suggested tables: `items`, `fts_docs`, `on_this_day`, `links`, `import_jobs`, `embeddings` (optional).

**Rule:** never store the only copy of user narrative in SQLite.

---

## 16. Deletion semantics

| Delete | Behavior |
|--------|----------|
| Evidence | Remove file; break or soft-null links; audit |
| Fact | Remove or `status: retracted` |
| Biography chapter | Remove from index + file |
| Vault | Delete vault tree + keys app controls; optional remote ciphertext delete |
| Tombstones | Optional short-lived markers for sync |

---

## 17. Schema versioning

`vault/meta.yaml`:

```yaml
vault_id: sc_vault_01h...
schema_version: 1
created_at: 2026-07-26T00:00:00Z
app_min_version: "0.1.0"
wellbeing:
  enabled: false
evening_ritual:
  enabled: false
  max_questions: 3
```

Migrations are additive where possible; document in `docs/adr/` when breaking.
