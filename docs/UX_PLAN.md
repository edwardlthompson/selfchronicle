---
title: SelfChronicle Feature & UX Plan (summary)
status: planning
replaces: CreatePlan (tool unavailable in this environment)
primary_client: PWA
related:
  - docs/UX_FLOWS.md
  - docs/SCREEN_INVENTORY.md
  - docs/MCP_HANDOFF.md
  - docs/PRIVACY.md
  - docs/SECURITY.md
note: >
  Cross-link only; do not overwrite PRIVACY/SECURITY or expected
  ARCHITECTURE/DATA_MODEL/IMPORT from other agents.
---

# SelfChronicle Feature & UX Plan

Concrete UX decisions for planning. **No production UI implementation** in this pass.

## Stated defaults

| Area | Decision |
|---|---|
| Client | **PWA** (installable, offline-first) |
| Tone | Warm, reflective, non-clinical |
| Day Close notifications | Local only if permissioned; else in-app cue |
| Interruption policy | Quiet hours + Focus Mode + evening schedule window; **no IDE scraping** |
| MCP | Explicit **per-session** or **per-action** permission prompts |
| Vault | Plain Markdown + YAML frontmatter |
| Day Close | Opt-in; **max 3 questions**; free-form recap allowed; easy skip/snooze |
| Wellbeing / Personality | Soft, provisional, user-editable |
| Imports | User-initiated only (no silent scraping) |

## Terminology (layers)

Use everywhere in UI copy and IA:

1. **Evidence** — raw notes, Day Close answers, imports  
2. **Facts/Insights** — distilled editable claims  
3. **Personality** — provisional psychological / preference summary  
4. **Living Biography** — compiled, user-editable narrative  
5. **Curiosity File** — questions the product may ask  
6. **Wellbeing Signals** — soft, provisional, editable  
7. **On This Day** — anniversary resurfacing  

## UX decision summary

### Day Close
- Off until opt-in; time-aware soft prompt near typical bedtime.
- Optional free-form recap + up to **3** Curiosity/Evidence questions; each skippable.
- Warm good-night close; answers write **Evidence**, then feed distillation pipeline.
- Suppress when Focus Mode, OS DND/quiet, outside window, or user mid-sensitive flows.
- Deep work = user/OS signals only—never hook coding tools.

### Profile Dashboard
- Hub for Living Biography, Personality, Wellbeing strip, Key Facts, Timeline, On This Day, reflective (non-clinical) stats.
- Full **Audit & Vault** with “Why is this here?” provenance and edit/delete for every item.
- Share Biography only via intentional export.

### Learning Mode
- Dedicated destination for deeper Curiosity File work; not task popups.
- Suggests Focus Mode on enter; separate from future task-relevant assistant questions.

### Memory Handoff
- Export wizard → `HANDOFF.md` + selected layer files (Wellbeing default off).
- MCP tools for list/read/search/summary/On This Day/append Evidence; sensitive writes confirm per action.
- Activity logged under Audit.

## Deliverable map

| File | Contents |
|---|---|
| [UX_FLOWS.md](./UX_FLOWS.md) | Detailed flows for Day Close, Dashboard, Learning Mode, Handoff |
| [SCREEN_INVENTORY.md](./SCREEN_INVENTORY.md) | Screens & components |
| [MCP_HANDOFF.md](./MCP_HANDOFF.md) | Export pack + MCP tools & permissions |
| This file | Executive plan / locked defaults |

## Coordination with other agents
Do **not** overwrite `PRIVACY.md`, `SECURITY.md`, or expected `ARCHITECTURE.md` / `DATA_MODEL.md` / `IMPORT.md`. Privacy/security product rules live there; this plan only covers UX surfaces and flows.

## Suggested next planning steps (not implementation)
1. Align Evidence note frontmatter schema with DATA_MODEL when available.  
2. Wire Day Close compile cadence (immediate vs deferred) in ARCHITECTURE.  
3. Privacy copy review for notification + MCP session language.  
4. Visual tone exploration (still planning) consistent with warm/non-clinical—avoid clinical dashboards.
