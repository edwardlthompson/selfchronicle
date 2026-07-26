# SelfChronicle — Privacy Design

> **Status:** Planning document (product privacy design).
> **Not legal advice.** This describes intended product behavior and defaults. A formal privacy policy for any hosted offering should be reviewed by counsel before public launch.

SelfChronicle is a **privacy-first, FOSS, local-first** personal memory and living biography application. Privacy is a core product property, not an afterthought.

---

## 1. Principles

| Principle | Meaning |
|-----------|---------|
| Local-first by default | All user data lives on the user’s device unless they explicitly enable optional sync or export. |
| User ownership | The vault belongs to the user. They can inspect, edit, export, and delete it. |
| Minimal collection | The core app does not require accounts, cloud storage, or network access. |
| No silent sharing | Nothing leaves the device without an explicit, understandable user action. |
| Provenance | Every stored fact and evidence item records where it came from and when it was ingested or edited. |
| No clinical claims | Soft wellbeing signals are optional, editable, and never presented as diagnosis. |
| FOSS & inspectable | Source is open; telemetry is off by default. |
---

## 2. What SelfChronicle stores

Typical vault contents (local unless the user opts into sync):

- **Narrative & biography material** — Markdown notes, timelines, summaries the user or importers create.
- **Facts & structured index** — Claims about people, places, events, dates, relationships (YAML / structured index as defined elsewhere).
- **Evidence** — Source pointers, excerpts, import artifacts, attachments metadata.
- **Provenance records** — Source system, import job id, timestamps, transform notes.
- **Optional wellbeing signals** — Soft, user-editable tags or hints (e.g. mood-adjacent labels). Never clinical diagnoses.
- **Settings & keys** — Preferences; encryption material managed per `SECURITY.md` (not plaintext secrets in the vault tree).
- **Audit log** — What was imported/changed and when (see Security).

SelfChronicle does **not**, by default, upload any of the above to SelfChronicle operators or third parties.

---

## 3. Local-first storage (default)

- The primary store is a **local vault** (Markdown + YAML and any structured index), on-device.
- The PWA / desktop client works without an account.
- Network access is used only when the user initiates: optional sync, optional MCP tool calls they approve, updates the user chooses to fetch, or explicitly opted-in anonymous stats (if ever enabled).
- Uninstall / vault delete removes local data subject to OS backup caches the user controls (document this in UX: “also clear device backups if you use them”).

---

## 4. Cloud sync (optional, client-side encrypted)

If the user enables sync:

1. **Client-side encryption is mandatory** before any vault bytes reach a sync provider.
2. The sync provider (SelfChronicle-hosted or user-chosen) must receive **ciphertext only**. Operators and providers **must not** be able to read plaintext facts, notes, or evidence.
3. **Primary sync crypto:** [age](https://age-encryption.org/) (X25519 + ChaCha20-Poly1305), chosen for file-/bundle-oriented vault sync. See `SECURITY.md` for key handling and rationale.
4. Sync is **opt-in**. Defaults remain fully local.
5. Disabling sync does not grant the provider new access; remote ciphertext should be deletable by the user (remote wipe / unlink documented in Security).

---

## 5. Deletion & control

Users must be able to:

| Action | Requirement |
|--------|-------------|
| Delete a fact | Remove from structured index and related surfaces; provenance of deletion may remain in audit log unless user purges audit. |
| Delete an evidence item | Remove item and unlink from facts; user-visible “missing evidence” handling as per UX. |
| Edit any soft wellbeing signal | Full edit, clear, or disable category/feature. |
| Delete the entire vault | Secure wipe of local vault + keys the app controls; optional remote ciphertext delete if sync was used. |
| Export before delete | Encouraged; user owns their data. |
“Delete” means the app no longer presents or recovers the content under normal use. Cryptographic erasure of keys (where used) is preferred for sensitive sections (`SECURITY.md`).

---

## 6. Provenance

Every piece of data SHOULD carry clear provenance, including at minimum:

- **Source** — e.g. manual entry, import connector name, MCP tool, file path class (not necessarily absolute secrets).
- **When** — ingested_at / created_at / updated_at (UTC).
- **How** — import job or transform identifier when applicable.
- **Confidence / status** — user-facing distinction between raw evidence, inferred fact, and user-confirmed fact (details in data model docs).

Provenance is shown in UI wherever facts or evidence are consumed, so users can trust or challenge the biography.

---

## 7. Soft wellbeing signals — disclaimers & control

SelfChronicle may offer **optional, soft wellbeing-related signals** (labels, patterns, gentle reflections). These:

- **MUST** display strong, persistent disclaimers: not medical advice; not a clinical tool; not a diagnosis.
- **MUST** remain fully **editable** and **disableable** (per-signal and globally).
- **MUST NOT** claim or imply clinical diagnosis, treatment, or disorder labeling.
- **MUST NOT** be required to use core memory/biography features.
- Should avoid alarming or deterministic health language.

Copy guidance (illustrative):

> These insights are optional reflections generated from your own notes. They are not a medical or psychological diagnosis. You can edit or turn them off anytime.

---

## 8. Imports — no silent scraping

SelfChronicle ingests personal history **only** through user-initiated channels:

| Allowed | Forbidden |
|---------|-----------|
| Official account data exports the user downloads | Background scraping of phone/desktop LLM apps |
| Manual paste, file picker, share target | Cookie/session harvesting to pull chats silently |
| Explicit “Send to SelfChronicle” extension actions | Accessibility overlays or keylog-style capture |
| Future official OAuth/API with clear consent (ADR) | Any “auto sync my AI chats” without an export step |
In-app **step-by-step export guides** must accompany every importer ([IMPORT_PIPELINE.md](./IMPORT_PIPELINE.md)). Parsers run **on device**; export contents are not uploaded to SelfChronicle operators.

---

## 9. Evening reflection ritual

The optional **Day Close** ritual (max **3** questions) is **opt-in** and off by default (`evening_ritual.enabled` in vault meta).

- No notifications until the user enables the ritual **and** grants notification permission
- Questions may come from the Curiosity File or gentle templates—never coercive
- Answers are normal evidence notes under the user’s control
- Disabling the ritual stops prompts; existing answers remain until the user deletes them

---

## 10. MCP & third-party tools

When MCP (or similar) is available:

- Calls run only with **explicit user permission** (per-session or per-tool grants as designed in Security).
- Tools receive the **minimum** context the user authorizes—not the whole vault by default.
- Data sent to an MCP server is subject to that server’s privacy practices; SelfChronicle must warn that **external tools may see plaintext** for the authorized scope.
- Revocation stops further sharing; it cannot retroactively erase data already sent to a third party—disclose this clearly.

---

## 11. Telemetry & analytics

| Mode | Default | Behavior |
|------|---------|----------|
| Product telemetry | **Off** | No crash/usage pipelines that phone home. |
| Anonymous usage stats | **Off** | Only if user **explicitly opts in**. |
| Opt-in stats (if implemented) | — | Aggregate, non-content: e.g. app version, coarse feature counts. **Never** vault text, facts, evidence, or identifiers that re-identify the person. |
| Marketing trackers | Forbidden in core | No ad IDs, fingerprinting, or third-party ad pixels. |
Network requests for updates or docs should not smuggle usage analytics.

---

## 12. Accounts & identity

- **No account required** for local use.
- If optional accounts exist later (e.g. to locate encrypted sync blobs), account metadata must be minimized and **must not** imply server-side plaintext vault access.
- Auth for sync ≠ ability for the operator to decrypt content.

---

## 13. Children & sensitive data

SelfChronicle is aimed at personal adult use. It will store highly sensitive life data by nature. Product messaging should discourage use as a covert surveillance tool on others and remind users of local laws and consent when importing data about other people.

---

## 14. Licensing, FOSS & contributions (privacy-relevant)

- **Recommended license:** **MIT** (aligned with bootstrap template). See `LICENSING.md`.
- Open source enables independent audit of privacy and crypto claims.
- Contributors must not add telemetry, remote logging of vault content, or plaintext cloud uploads without explicit design review and user-facing opt-in.
- Outline for `CONTRIBUTING.md`: code of conduct pointer, how to propose changes, privacy/security review expectations for networking and crypto PRs, no secrets in issues, align with template CONTRIBUTING where present.

---

## 15. User-facing privacy summary (short)

1. Your biography stays on your device by default.
2. Optional sync is encrypted on your device first—providers see only ciphertext.
3. You can delete any fact, evidence, or the whole vault.
4. Everything shows where it came from.
5. Wellbeing hints are optional, editable, and never a diagnosis.
6. We don’t watch you: no telemetry unless you turn on anonymous stats.
7. We never silently scrape AI chats—only exports and imports you start.
8. Evening reflection is optional (max 3 questions) and off by default.

---

## 16. Related documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — system boundaries, PWA, sync, MCP
- [DATA_MODEL.md](./DATA_MODEL.md) — layers and schemas
- [IMPORT_PIPELINE.md](./IMPORT_PIPELINE.md) — sources and in-app export guides
- [SECURITY.md](./SECURITY.md) — threat model, encryption, keys, audit log, MCP boundaries
- [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) — repo vs vault paths
- [UX_FLOWS.md](./UX_FLOWS.md) — Day Close and permissions UX
- `LICENSING.md` — MIT recommendation, contributions, telemetry policy
