# Build Plan

> Prioritized task board with owner labels. **Completed sprints:** `COMPLETED_TASKS.md`.

## Owner Label Legend

| Label   | Owner           | When to use                                                |
| ------- | --------------- | ---------------------------------------------------------- |
| `AGENT` | Cursor Agent    | Code, docs, scaffolding, tests, CI config                  |
| `HUMAN` | Human developer | Approvals, credentials, GitHub settings, product decisions |
| `ADB`   | Human (Android) | Android SDK, emulator/device testing, F-Droid submission   |
| `AUTO`  | CI/scripts/bots | GitHub Actions, Dependabot, pre-commit, update checker     |
## Status markers

Use **emoji markers** (not `- [ ]` GitHub checkboxes) so task state reads clearly in Markdown source and Preview. **Applies repo-wide** — `BUILD_PLAN.md`, module checklists, PR template, feature specs, and security triage.

| Marker | State   | Agent action                                                          |
| ------ | ------- | --------------------------------------------------------------------- |
| 🔲     | Open    | Default for new tasks; work or leave queued                           |
| ✅      | Done    | Replace 🔲 when complete; archive sprint rows to `COMPLETED_TASKS.md` |
| ❌      | Blocked | Replace 🔲 when blocked; add brief reason after the description       |
**Task format:** `🔲 [OWNER] Description` · done: `✅ [OWNER] Description` · blocked: `❌ [OWNER] Description — reason`

```bash
grep '\[AGENT\]' BUILD_PLAN.md
grep '\[HUMAN\]' BUILD_PLAN.md
grep '\[ADB\]' BUILD_PLAN.md
grep '\[AUTO\]' BUILD_PLAN.md

```

**Agent rule:** Execute all `[AGENT]` **Sequential** items first, then dispatch **Parallel** agents with isolated file scopes (`docs/PARALLEL_AGENT_SCOPES.md`). Shared schema/types are Sequential-only.

### Parallel dispatch protocol (orchestrator)

| Step | Action                                                                                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Finish all `[AGENT]` **Sequential** items for the active sprint/feature (shared schema/types locked)                                                                       |
| 2    | **Discover** parallelizable work using the decomposition checklist below; add Parallel table rows with non-overlapping ``path/**`` scopes                                  |
| 3    | Run `bash scripts/plan-parallel-dispatch.sh` → read **agent_count**                                                                                                        |
| 4    | If `agent_count >= 2`, run `/scope` (auto Task dispatch); if `1`, execute inline; if `0`, run `--suggest` and expand the Parallel table (or document `parallel_exception`) |
| 5    | Sequential owner merges results, runs `watch-agent-gates.sh`, updates BUILD_PLAN (Parallel agents never edit BUILD_PLAN)                                                   |
**Decomposition checklist** (apply before finalizing Sequential items):

| Heuristic                     | Split into Parallel agents                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| Multi-stack repo              | One agent per active module (`examples/{stack}/`**)                                         |
| Feature container (Sprint 2+) | Agent A: pure logic + unit tests; Agent B: view/Composable + i18n                           |
| Tests vs production code      | Separate `**/*.test.*`, `e2e/**`, `androidTest/**` when paths do not overlap implementation |
| Docs vs code                  | Agent A: `examples/**`; Agent B: `docs/**`, `modules/**`, `.cursor/rules/**`                |
| CI/gates vs app code          | Agent A: `scripts/**`, `.github/workflows/**`; Agent B: stack example tree                  |
**Default rule:** If a Sequential `[AGENT]` item touches two or more non-overlapping directory prefixes, **split it** — leave only schema-lock work Sequential.

**Planning (Plan Mode):** Every BUILD_PLAN proposal must include `### Parallelization` with `agent_count_target`, decomposition table, and dry-run from `plan-parallel-dispatch.sh`. Run `check-build-plan-parallel.sh` before human approval.

**Autonomous `/build`:** Runs all `[AGENT]`/`[AUTO]` and Parallel work first, then attempts the grouped **Human & device (after automation)** section via `scripts/attempt-build-plan-row.sh`. Success marks ✅; failure appends `HUMAN_BACKLOG.md` and continues — never halts on human labels. Humans review the grouped section (and backlog) after automation finishes. Status: `bash scripts/build-sprint-status.sh --json`.

> **SelfChronicle active board** below (P0–P2). Planning index: `docs/PLANNING_INDEX.md`. Template history remains under **Archived Sprints** / **Ongoing Maintenance**.

### Parallelization (SelfChronicle)

| Field | Value |
|-------|--------|
| `agent_count_target` | 2–3 after schema lock each sprint |
| Decomposition | Logic/tests vs view/i18n vs `docs/features/*`; `examples/web/**` vs `examples/node/**` non-overlapping |
| Dry-run | `bash scripts/plan-parallel-dispatch.sh` before multi-agent dispatch (document `parallel_exception` if unavailable) |
**P0 shell IA (reduced):** Today · Profile · Vault · Settings. Learn + Handoff promote to primary nav in P1 (or nest under Profile until then).

**Global acceptance (every feature sprint):** warm/non-clinical tone; Skip·Edit·Why on derived content; Day Close opt-in max 3 + Focus/DND suppress; Wellbeing off in handoff default; intentional share only; vault path hints + Evidence save receipts; **no silent scraping**.

---

## SelfChronicle — Active Board

> Product: privacy-first local memory & living biography. Stack: web/PWA + node (MCP). Refs: `docs/ARCHITECTURE.md`, `DATA_MODEL.md`, `UX_FLOWS.md`, `SCREEN_INVENTORY.md`, `IMPORT_PIPELINE.md`, `MCP_HANDOFF.md`, `PRIVACY.md`, `SECURITY.md`.

### Sprint M35 — Audit 2026-07-26 (open follow-ups)

<!-- parallel_exception: M35 follow-ups are HUMAN/ADB/AUTO only — no AGENT Parallel rows -->

> **M35** AGENT work archived in `COMPLETED_TASKS.md` @ `28ec38b`. Findings: `CODE_REVIEW.md`. (Supersedes M34 open follow-ups.)

- 🔲 [HUMAN] F-002 — Prioritize age-encrypted Drive vault pack (`DRIVE_PACK_CLEARTEXT` → false); UX warning until shipped
- 🔲 [ADB] F-006 — Review Capacitor Android `allowBackup` vs vault privacy defaults
- 🔲 [AUTO] F-004 — Triage OpenSSF Scorecard CodeQL (pinned-deps, token-permissions)

### Risks & mitigations (board reminder)

| Risk | Mitigation |
|------|------------|
| P0 scope creep | Exit criteria after Sprint 5; Learning/MCP/Personality stay P1 |
| Large Takeout / OPFS limits | Stream parse; size warnings; files SoT |
| MD vs SQLite drift | Rebuildable index + Rebuild control |
| Export format churn | Pin `parser_version`; fixtures; sidecars |
| MCP over-permission | Default deny; short sessions; per-action writes; audit |
| Clinical misread | Wellbeing off; provisional badges; no auto-publish facts |
| Morality/IQ misread | No single morality score; no IQ tests; cognition = preferences/bands; handoff default off (Sprint 12) |
| Parasocial / fake humanity | Companion Trust charter; AI disclosure; no “I’ll be lonely”; forget-respect (Sprint 13) |
| Third-party PII in imports | Review-before-commit; `retain_raw` false |
| Cloud handoff overshare | Compiled layers default; “leaves your device” warning |
### Open (human judgment)

- 🔲 [HUMAN] Quarterly review of `CURSOR_RADAR_REPORT.md` / backlog (top items → BUILD_PLAN)

*Recurring maintenance: see **Ongoing Maintenance** below.*

> **Sprints 0–5 (P0)** archived in COMPLETED_TASKS.md @ `b81412a`.
> **Sprint 6** archived in COMPLETED_TASKS.md @ `b81412a`.
> **Sprints 7–9 (P1)** archived in COMPLETED_TASKS.md @ `b81412a`.
> **Sprints 10–13 (P2 / depth / trust)** archived in COMPLETED_TASKS.md @ `b81412a`.
> **M34 — Audit 2026-07-26** AGENT/AUTO archived in COMPLETED_TASKS.md @ `b81412a`.

**P0 exit:** Offline vault; Day Close → Evidence; Biography/Facts; ChatGPT+paste import; Handoff; audit + wipe; no telemetry.
**P1 exit:** Distillation; Learning; Focus/quiet; Timeline/search; MCP grants; major import adapters.

### Function surface (track inside feature specs)

`vault.open/status` · `evidence.*` · `facts.*` · `biography.*` · `personality.*` · `curiosity.*` · `wellbeing.*` · `morality.*` · `cognition.*` · `profile.summary.*` · `chapters.*` · `charter.*` · `trust.forget` · `onThisDay.query` · `import.*` · `handoff.export` · `audit.list` · `vault.export/wipe` · `vault.health` · MCP wrappers (per-session / per-action)

### Screen ID index (see `docs/SCREEN_INVENTORY.md`)

| Tier | IDs |
|------|-----|
| P0 | SH-01, TD-01–02, DC-01–06/08, PD-01–04/08–11/13–14, IM-01–02, HO-01–03, ST-01/02/04/06/07 |
| P1 | LM-01–05, PD-05–07/10/12, HO-04–07, SH-02–04, ST-03/05, DC-07 |
| P2 / depth | Sprint 11 surfaces; MM-01–03, CG-01–02, LM-06 |
| Trust / bio | PD-15–16, CT-01–04, BL-01–03 (Sprint 13) |
**Agent rule:** After every `[AGENT]` step → `bash scripts/watch-agent-gates.sh --once --autofix --step <scaffold|tests|wire>` when applicable.

---

## Ongoing Maintenance (recurring)

> **Template maintainer:** `bash scripts/run-maintainer-gates.sh` weekly (omit `--quick` for full CI wait).

### Weekly

- 🔲 [AUTO] `cursor-feature-radar.sh` (non-blocking; artifact in weekly-health-check)
- 🔲 [AUTO] `check-security-triage.sh --wait-ci 300` (Dependabot + CI + Scorecard)
- 🔲 [AGENT] Apply Dependabot bumps; triage Scorecard SARIF findings
- 🔲 [AUTO] CI matrix + Repo Hygiene + Feature Gate green on `main`

### Monthly

- 🔲 [AUTO] `simulate-template-upgrade.sh` (also in `weekly-health-check.yml`)
- 🔲 [AUTO] `check-license-compliance.sh` + SBOM on latest release
- 🔲 [AGENT] Review Dependabot auto-merge PRs (KB-007)

### Pre-release (every version)

- 🔲 [AUTO] `pre-release-gate.sh` + `run-maintainer-gates.sh` (includes `verify-branch-protection.sh`)
- 🔲 [AUTO] Release Please PR merged; CHANGELOG + manifest bumped

### Human (after automation)

> Product approvals after automated pre-release gates pass.

- 🔲 [HUMAN] Approve release tag when product-ready
- 🔲 [HUMAN] Quarterly Cursor feature radar backlog review (see Sprint M30)

---

## Archived Sprints

| Sprint                                                            | Status   | Archive                          |
| ----------------------------------------------------------------- | -------- | -------------------------------- |
| M35 — Audit 2026-07-26 (AGENT)                                    | Partial  | `COMPLETED_TASKS.md` @ `28ec38b` |
| M34 — Audit 2026-07-26                                            | Complete | `COMPLETED_TASKS.md` @ `b81412a` |
| SelfChronicle Sprints 0–5 (P0)                                    | Complete | `COMPLETED_TASKS.md` @ `b81412a` |
| Sprint 6 — Distillation / soft layers / Learning                  | Complete | `COMPLETED_TASKS.md` @ `b81412a` |
| SelfChronicle Sprints 7–9 (P1)                                    | Complete | `COMPLETED_TASKS.md` @ `b81412a` |
| SelfChronicle Sprints 10–13 (P2 / depth / trust)                  | Complete | `COMPLETED_TASKS.md` @ `b81412a` |
| v0.15.0 release                                                   | Complete | `COMPLETED_TASKS.md` @ `2e010ae` |
| M33 — Cursor 3.9–3.11 + local-first compute                       | Complete | `COMPLETED_TASKS.md` @ `5d2d129` |
| v0.14.1 release                                                   | Complete | `COMPLETED_TASKS.md` @ `a6c6be1` |
| M32 — Audit 2026-07-12                                            | Complete | `COMPLETED_TASKS.md` @ `e532c20` |
| v0.14.0 release                                                   | Complete | `COMPLETED_TASKS.md` @ `4b94298` |
| v0.13.2 release                                                   | Complete | `COMPLETED_TASKS.md` @ `ff8e4e6` |
| M31 — Audit 2026-07-01                                            | Complete | `COMPLETED_TASKS.md`             |
| M30 — Cursor FOSS integration + feature radar                     | Complete | `COMPLETED_TASKS.md` @ `508a541` |
| M19–M29 — Cursor modes, batch commands, maintain, v0.11.0 release | Complete | `COMPLETED_TASKS.md`             |
| v0.10.0 release (`36a02e4`)                                       | Complete | `COMPLETED_TASKS.md`             |
| M5–M18 maintainer sprints (seq + P2)                              | Complete | `COMPLETED_TASKS.md` @ `d6b92a2` |
| Child Sprint 2 starter scaffold                                   | Complete | `COMPLETED_TASKS.md`             |
| v0.9.0 release (`fd699bc`)                                        | Complete | `COMPLETED_TASKS.md`             |
