---
title: SelfChronicle Screen & Component Inventory
status: planning
primary_client: PWA
related:
  - docs/UX_PLAN.md
  - docs/UX_FLOWS.md
  - docs/MCP_HANDOFF.md
  - docs/PRIVACY.md
---

# Screen & Component Inventory

Planning-only inventory for the PWA. Names are UX labels, not final route codes. Vault mental model: plain Markdown + YAML frontmatter.

## App shells

| ID | Screen | Purpose | Primary layers touched |
|---|---|---|---|
| SH-01 | App Shell / Nav | Bottom or side nav: Today, Profile, Learn, Vault, Settings | — |
| SH-02 | Focus Mode overlay chip | Persistent “Focus on · Day Close muted” chip when Focus active | — |
| SH-03 | Quiet Hours banner | Optional soft notice when cues suppressed | — |
| SH-04 | Permission session toast | “Cursor MCP can read Facts for 1 hour” | Handoff |

## Today / Home

| ID | Screen | Purpose | Components |
|---|---|---|---|
| TD-01 | Today Home | Calm daily landing | Greeting, On This Day teaser, Close the day CTA, Recent Evidence |
| TD-02 | Soft Day Close cue | In-app banner during evening window | CTA Begin / Snooze / Skip |
| TD-03 | Local notification payload | OS notification (if permissioned) | Title + two actions: Begin, Snooze |

## Day Close (“Evening Reflection Ritual”)

| ID | Screen | Purpose | Components |
|---|---|---|---|
| DC-01 | Day Close entry | Opt-in explanation + window picker | Toggle, bedtime window, notification permission ask |
| DC-02 | Ritual shell | Progress dots (≤4), Skip all, Focus-safe | Header, calm background |
| DC-03 | Free-form recap | “How was today?” optional | Textarea, Skip, Voice-to-text (optional later) |
| DC-04 | Question card (×≤3) | One Curiosity / Evidence-derived question | Question, answer field, Skip question, Why this question? |
| DC-05 | Good-night close | Warm close + save confirmation | Message, “Saved to Evidence”, Done |
| DC-06 | Snooze picker | 20 / 40 / 60 min | Sheet |
| DC-07 | Missed-night gentle offer | “Close yesterday?” once | Begin / Dismiss |
| DC-08 | Day Close settings | Window, quiet hours, max questions display (fixed 3), pause | Form |

### Day Close micro-components
- `QuestionSkipControl`
- `ProvisionalBadge` (for any derived preview)
- `EvidenceSaveReceipt` (“Written to `evidence/2026-07-26-day-close.md`”)
- `WhyThisQuestion` sheet → links Curiosity File item or Evidence snippets

## Profile Dashboard

| ID | Screen | Purpose | Components |
|---|---|---|---|
| PD-01 | Profile Dashboard hub | Composition overview | Biography preview, Personality blurb, Wellbeing strip, On This Day, Facts peek, Stats |
| PD-02 | Living Biography reader | Chapter list + reader | TOC, Markdown body, Edit, Share, Regenerate section |
| PD-03 | Biography editor | Edit compiled narrative | Friendly form + Raw Markdown toggle, Save, Diff vs compiled |
| PD-04 | Biography share/export | Intentional share | Format picker (MD / pack), Copy, Download |
| PD-05 | Personality summary | Soft psychological profile | Claim cards, confidence/provisional, evidence links, Edit/Delete |
| PD-06 | Personality claim editor | Correct a claim | Text, “Don’t use in Biography”, source unlink |
| PD-07 | Wellbeing Signals panel | Soft signals | Editable chips/sliders-as-labels, history, dismiss signal |
| PD-08 | Key Facts list | Searchable facts | Fact row, source count, edit |
| PD-09 | Fact detail / editor | Single fact | Frontmatter fields, linked Evidence, Delete |
| PD-10 | Life Timeline | Chronological spine | Timeline nodes → Fact/Evidence |
| PD-11 | On This Day feed | Anniversary cards | Card, Remember, Add note, Hide |
| PD-12 | Insights & reflective stats | Non-clinical insights | Theme clouds, ritual consistency as story not score |
| PD-13 | Audit & Vault browser | All stored items | Filters by layer, search, open item |
| PD-14 | Item inspector (“Why is this here?”) | Provenance | Derivation path Evidence → Fact → Biography |

### Profile micro-components
- `LayerBadge` (Evidence / Fact / Personality / Biography / Curiosity / Wellbeing / On This Day)
- `ProvisionalCallout`
- `ShareIntentSheet` (never ambient public)
- `RawMarkdownToggle`
- `OnThisDayCard`
- `TimelineNode`
- `StatStoryCard` (narrative stats, not clinical metrics)

## Learning Mode

| ID | Screen | Purpose | Components |
|---|---|---|---|
| LM-01 | Learning Mode home | Enter deeper questioning | Depth picker, theme pins, Focus suggest |
| LM-02 | Learning session | Question thread | Curiosity prompts, answer, save draft |
| LM-03 | Curiosity File browser | Open questions list | Status: open / asked / answered / snoozed |
| LM-04 | Curiosity item editor | Add/edit question | Tags (`evening`, `deep`), priority |
| LM-05 | Session wrap | What was saved | Evidence links, suggested Biography touch-ups |

## Handoff / MCP

| ID | Screen | Purpose | Components |
|---|---|---|---|
| HO-01 | Handoff Center | Export + MCP status | Export CTA, Connected clients, Activity |
| HO-02 | Export wizard | Layer picker → generate pack | Checkboxes per layer, tone (1st/3rd person), Wellbeing default off |
| HO-03 | Export result | `HANDOFF.md` + files | Copy prompt, Download zip, Client how-tos |
| HO-04 | MCP connect / permissions | Grant scopes | Per-session / per-action toggles, expiry |
| HO-05 | Active session panel | What tools can see | Revoke, extend, scope chips |
| HO-06 | Action confirm modal | Sensitive write | Diff preview, Allow once / Deny |
| HO-07 | MCP activity log | Audit entries | Tool, scope, timestamp, vault paths |

## Import / Capture (coordination only — details in Import doc)

| ID | Screen | Purpose | Notes |
|---|---|---|---|
| IM-01 | Import launcher | User-initiated only | Do not design silent scrapers; cross-link Import doc |
| IM-02 | Manual file drop | Markdown / export packs | Maps into Evidence |

## Settings & Trust

| ID | Screen | Purpose | Components |
|---|---|---|---|
| ST-01 | Settings hub | Privacy, sync, rituals, MCP | Groups |
| ST-02 | Privacy & ownership | Local-first explainer | Links to Privacy doc |
| ST-03 | Sync & encryption | Optional cloud | Client-side encryption copy |
| ST-04 | Notifications & quiet hours | Permission + windows | OS permission state |
| ST-05 | Focus & deep work | Focus Mode, calendar optional busy | No IDE telemetry |
| ST-06 | Data export / delete | Full vault export, wipe | Dangerous actions confirmed |
| ST-07 | FOSS / about | License, source, vault path | Trust |

## Shared component library (design system notes)

| Component | Usage |
|---|---|---|
| `WarmEmptyState` | No guilt; invites one gentle action |
| `SoftConfirm` | Deletes / overwrites |
| `FrontmatterForm` | Friendly editors over YAML |
| `VaultPathHint` | Shows relative path in vault |
| `OfflinePill` | Local-first status |
| `PermissionCard` | Notification / MCP / sync |

## Navigation map (suggested)

```
Today
Profile  → Biography | Personality | Facts | Timeline | On This Day | Insights | Audit
Learn    → Session | Curiosity File
Vault    → shortcut into Audit & file tree
Handoff  → Export | MCP
Settings
```

Day Close is modal/flow over Today, not a primary nav item (settings live under Settings → Day Close).

## Copy tone checklist (per screen)
- Prefer: remember, gently, perhaps, you noted, rest well
- Avoid: diagnose, disorder, compliance, streak broken, score
- Always offer Skip / Edit / Why on derived content
