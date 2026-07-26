---
title: Cross-LLM Memory Handoff & MCP
status: planning
primary_client: PWA
permission_model: explicit per-session or per-action
related:
  - docs/UX_FLOWS.md
  - docs/SCREEN_INVENTORY.md
  - docs/UX_PLAN.md
  - docs/PRIVACY.md
  - docs/SECURITY.md
  # Cross-link when present:
  # - docs/ARCHITECTURE.md
  # - docs/DATA_MODEL.md
---

# Cross-LLM Memory Handoff & MCP

Planning-only. Portable memory for any LLM, plus an MCP server so tools like Cursor or Claude Code can read/write the vault **with user permission**.

## Goals
- User can inject a coherent SelfChronicle profile into ChatGPT, Claude, Gemini, local models, etc.
- Agent IDEs can use MCP tools against the local vault without silent full access.
- Aligns with local-first, FOSS, user-owned Markdown vault.

## Mental model for users

> Your vault is plain Markdown with YAML frontmatter. Handoff packages a **prompt** plus **selected notes**. MCP lets a trusted tool read or write those same notes—only while you say yes.

---

## 1. Portable export (any LLM)

### Export pack contents

| File / artifact | Description |
|---|---|
| `HANDOFF.md` | Preamble/system prompt: who the user is, how to treat provisional Personality & Wellbeing, cite uncertainty |
| `biography/` | Selected Living Biography chapters (Markdown) |
| `facts/` | Key Facts notes |
| `personality.md` | Personality summary (provisional language preserved) |
| `curiosity.md` | Open Curiosity File questions (optional) |
| `wellbeing.md` | Wellbeing Signals (optional, **default excluded**) |
| `manifest.yaml` | Layer list, export time, redaction flags |

Evidence raw dumps are **opt-in** (can be large / sensitive); default pack is compiled layers only.

### Wizard decisions (UX)

1. **Voice**: first-person (“I am…”) vs third-person (“The user is…”).
2. **Layers**: Biography · Facts · Personality · Curiosity · Wellbeing (off) · Recent Evidence (off).
3. **Redaction presets**: Hide specific people tags, health detail, exact addresses (implementation later).
4. **Output**: Copy `HANDOFF.md` · Download `.zip` · Reveal folder in vault `/exports/…`.

### Example `HANDOFF.md` skeleton (copy guidance)

```markdown
---
type: handoff
generated: {{iso_date}}
layers: [biography, facts, personality]
wellbeing_included: false
---

# SelfChronicle memory handoff

Treat the attached notes as the user's own living memory vault.
- Prefer Living Biography and Facts for stable identity.
- Treat Personality as provisional and user-editable.
- Do not invent biography. If unsure, ask or say you don't know.
- Wellbeing Signals are soft, not clinical diagnoses.

## How to use
Read HANDOFF.md first, then biography/, facts/, personality.md as needed.
```

### Client how-to snippets (in-app)
- **ChatGPT / Claude.ai**: paste preamble + attach files.
- **Cursor**: add pack to repo or use MCP (preferred).
- **Claude Code**: MCP or `@` files from export folder.
- **Local LLM UI**: drop folder into RAG / project files.

---

## 2. MCP server (planning shape)

### Trust UX principles
- No tool runs until user starts a **permission session** or approves a **per-action** prompt.
- Default session: time-boxed (e.g. 1 hour) + scope-limited.
- Overwrites to Personality, Wellbeing Signals, or Living Biography → always per-action confirm with diff.
- All tool calls appear in **MCP activity log** (Audit & Vault).

### Suggested tools

| Tool | Permission tier | Description |
|---|---|---|
| `vault_list` | session:read | List notes by layer / path / date |
| `vault_read` | session:read | Read Markdown + frontmatter |
| `vault_search` | session:read | Search Facts / Biography / Evidence |
| `get_profile_summary` | session:read | Compact Personality + Facts + Biography abstract |
| `get_on_this_day` | session:read | On This Day cards for a date |
| `get_curiosity_open` | session:read | Open Curiosity File items |
| `append_evidence` | session:write-evidence | Create Evidence note (preferred write) |
| `propose_fact` | action:confirm | Propose Fact/Insight; user confirms |
| `update_personality` | action:confirm | Patch Personality claims |
| `update_wellbeing` | action:confirm | Patch Wellbeing Signals |
| `patch_biography` | action:confirm | Edit Living Biography chapter |
| `export_handoff` | session:read | Generate export pack programmatically |

### Out of scope for MCP (product rule)
- Silent scraping of IDE buffers, email, or OS activity.
- Bulk delete without confirm.
- Reading encrypted cloud blobs without local decrypt unlock.

### Permission session UX

```
Connect request from "Cursor"
  Scopes requested: read:facts, read:biography, write:evidence
  Duration: 1 hour | Until I revoke | Once
  [Allow] [Allow read-only] [Deny]
```

Active session panel shows: client name, scopes, expiry, **Revoke**.

### Per-action confirm

```
Claude Code wants to update Personality
  − "Prefers remote work" (provisional)
  + "Prefers hybrid work · source: evidence/…"
  [Allow once] [Deny]
```

---

## 3. Flows

### A. One-shot paste into another LLM
```
Handoff Center → Export wizard → Copy HANDOFF.md → Download pack → paste/attach elsewhere
```

### B. Cursor / Claude Code ongoing
```
Enable MCP in SelfChronicle → Approve session scopes
  → Agent calls get_profile_summary / vault_read
  → Agent append_evidence (session write)
  → Agent propose_fact → user confirms in PWA or IDE prompt bridge
  → Revoke session when done
```

### C. Learning vs work
- Task agents should use **minimal** `get_profile_summary` unless user expands scopes.
- Deep Curiosity questioning stays in **Learning Mode** in the PWA; MCP may `get_curiosity_open` but should not spam questions during coding (clients instructed via HANDOFF preamble + tool descriptions).

---

## 4. Alignment with layers

| Layer | In default export | MCP read default | MCP write |
|---|---|---|---|
| Evidence | Off | Opt-in scope | `append_evidence` (session) |
| Facts/Insights | On | On if read:facts | `propose_fact` (confirm) |
| Personality | On | On if read:profile | confirm |
| Living Biography | On (selected chapters) | On if read:biography | confirm |
| Curiosity File | Optional | Opt-in | confirm to edit file |
| Wellbeing Signals | Off | Off unless scoped | confirm |
| On This Day | Via tool, not always in pack | `get_on_this_day` | via Evidence append |

---

## 5. Security & privacy notes (UX-facing)
- Show vault path and “everything is files you can open.”
- Session tokens never imply cloud sharing.
- If optional encrypted sync exists, MCP talks to **local unlocked vault** only.
- Full detail belongs in Privacy / Architecture docs when written—link rather than duplicate.

## 6. Open questions
- Bridge for per-action confirms inside Cursor UI vs only in PWA.
- Whether `propose_fact` creates a draft note awaiting human merge.
- Rate limits / max payload size for `vault_read` to protect huge Evidence corpora.
