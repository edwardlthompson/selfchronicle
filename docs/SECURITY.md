# SelfChronicle — Security Model

> **Status:** Planning document (security design).  
> Implementation must follow these defaults unless a documented ADR changes them.

SelfChronicle holds highly sensitive personal history. The security model assumes **compromise of sync providers and casual device theft**, and aims to keep vault plaintext out of operator and provider reach.

---

## 1. Goals

- Confidentiality of vault contents at rest and in optional sync.
- Integrity of imported and user-edited data (detect tampering where practical).
- User control: export, delete, revoke MCP grants, rotate credentials.
- Auditable ingestion: what entered the vault and when.
- Least privilege for optional network features (sync, MCP).

---

## 2. Threat assumptions

### In scope (must defend)

| Threat | Mitigation direction |
|--------|----------------------|
| Sync provider or honest-but-curious operator reads vault | Client-side encryption; provider stores ciphertext only. |
| Network eavesdropper on sync | TLS in transit + encrypted payloads (defense in depth). |
| Malicious sync blob substitution | Authenticated encryption (age / AEAD); optional hash chain of sync epochs. |
| Casual device access (unlocked session) | App lock / OS auth optional; sensitive sections encrypted at rest. |
| Lost device with disk image | Platform keystore + password-derived keys; ciphertext at rest for sensitive sections. |
| Over-broad MCP / plugin access | Explicit grants, scoped context, revocation. |
| Accidental telemetry of content | Telemetry off by default; opt-in stats never include vault content. |
| Supply-chain / dependency compromise | Pin deps, FOSS review, minimal native crypto surface. |

### Out of scope / limited defense

| Threat | Notes |
|--------|-------|
| Fully compromised OS with malware as the user | Cannot guarantee confidentiality; document residual risk. |
| User coerced to reveal password / unlock device | Social / legal; optional duress UX is non-goal for v1. |
| Physical attacker with unlocked, authenticated session | Same as legitimate user for that session. |
| Side-channel attacks on browser JS crypto | Prefer WebCrypto / well-vetted WASM (libsodium, age); document browser limits. |
| Nation-state endpoint implant | Beyond product threat model. |

### Trust boundaries

```
┌─────────────────────────────────────────────┐
│ User device (trusted when unlocked by user) │
│  vault plaintext · keys · audit log         │
└──────────────────┬──────────────────────────┘
                   │ ciphertext only (age packages)
                   ▼
┌─────────────────────────────────────────────┐
│ Sync provider (untrusted for confidentiality)│
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ MCP / external tools (untrusted)            │
│  receive only user-authorized plaintext     │
└─────────────────────────────────────────────┘
```

---

## 3. Cryptography defaults

| Concern | Choice | Rationale |
|---------|--------|-----------|
| **Sync encryption (primary)** | **age** (X25519 + ChaCha20-Poly1305) | File-/bundle-oriented; simple recipient model; excellent fit for Markdown+YAML vault packages and sync epochs; mature, auditable, small design. |
| **Local encryption at rest (sensitive sections)** | **libsodium** (`secretbox` / **secretstream** for larger blobs) | Authenticated encryption; secretstream suits chunked attachments; widely available (incl. WASM). |
| **Password-derived keys** | **Argon2id** | Memory-hard KDF; default for passphrase → master key. Parameters tuned per platform (documented at implement time). |
| **Key wrapping** | libsodium `crypto_secretbox` / equivalent AEAD | Wrap data-encryption keys (DEKs) with KEK from keystore or Argon2id. |
| **In transit** | TLS 1.2+ | Always for sync and MCP HTTP transports. |

### Why age for sync (not libsodium secretstream as primary)

- Vault sync is naturally **file and snapshot oriented** (packs of Markdown/YAML + index).
- age encrypts to an **identity** the user controls; providers never hold decrypt capability.
- secretstream remains the better primitive for **local streaming** of large attachments and rotating keys inside the app—use it there, not as the sync package format.

**Passphrase mode of age:** prefer deriving or unlocking an **age X25519 identity** via Argon2id + local keystore rather than relying solely on age’s built-in scrypt passphrase recipients, so KDF policy stays consistent (Argon2id everywhere for user passwords).

---

## 4. Encryption at rest

### Scope

- **Sensitive sections** (configurable; defaults should include wellbeing-related fields, credentials, and optionally the full structured index / evidence store) are encrypted on disk.
- Narrative Markdown may start unencrypted for editability in external editors; product should offer **full-vault encryption** mode for users who want it.
- Temp files and search indexes that contain sensitive plaintext must be covered by the same policy or held only in memory.

### Key hierarchy (logical)

```
User passphrase (optional if platform unlock only)
        │ Argon2id
        ▼
   KEK (key-encryption key)
        │ wrap / unwrap
        ▼
   DEKs (per vault / per section)
        │
        ├──► libsodium secretstream/secretbox (local sensitive data)
        └──► age identity secret (for sync package decrypt)

Platform keystore (OS / WebAuthn / Credential Management where available)
        │ store or unlock
        ▼
   unlock token / wrapped KEK
```

- Prefer **platform keystore** when available (iOS Keychain, Android Keystore, OS secret store, browser WebCrypto non-extractable keys where feasible).
- Fallback: **password-derived** KEK via Argon2id; never store passphrase in plaintext.
- Clearing the vault deletes DEKs and wrapped material the app controls (cryptographic erasure).

---

## 5. Secure key management

| Requirement | Design |
|-------------|--------|
| Generation | Use CSPRNG from libsodium / WebCrypto. |
| Storage | Keystore or encrypted keybag; never commit keys to git or sync in plaintext. |
| Unlock | Biometric / OS auth unlocks keystore entry; or passphrase → Argon2id. |
| Rotation | Support DEK re-encrypt and age identity rotation; old sync ciphertext may need re-upload. |
| Backup | Recovery key / printed age identity backup is a UX requirement; without it, data loss on forgotten password is expected and disclosed. |
| Memory | Zeroize secrets where the platform allows; avoid logging keys. |

---

## 6. Optional sync security

1. User enables sync and chooses provider/endpoint.
2. Client builds a vault package or delta.
3. Client **age-encrypts** to the user’s age recipient(s).
4. Only ciphertext + opaque sync metadata (epoch id, sizes, hashes) are uploaded.
5. Download → client decrypts locally → merge per conflict rules (elsewhere).

Additional rules:

- Provider authentication (account token) **does not** decrypt content.
- Metadata minimization: avoid filenames that leak sensitive topics when possible (opaque object ids).
- Remote delete / unlink removes ciphertext blobs the user can still authenticate to delete.
- Multi-device: share age identity via secure channel or QR of encrypted key backup—not via the sync provider in plaintext.

---

## 7. Audit log

Maintain a local **audit log** of security- and privacy-relevant events:

| Event class | Examples |
|-------------|----------|
| Import | Connector name, job id, started/finished, item counts, errors—not full content dumps. |
| Destructive | Fact/evidence/vault deletes; remote wipe requests. |
| Sync | Enable/disable, epoch push/pull success/failure (no plaintext). |
| MCP | Grant, deny, revoke; tool name; scope summary; timestamp. |
| Crypto | Key rotation, lock/unlock failures (rate-limit noise). |

Properties:

- Append-oriented; user-exportable.
- Retained locally; **not** uploaded unless user explicitly exports.
- User may purge audit log (with warning that provenance of *events* is lost; fact-level provenance in the vault is separate).
- Sufficient to answer: “What was imported, and when?”

---

## 8. MCP permission boundaries

| Rule | Detail |
|------|--------|
| Default deny | No MCP tool runs without grant. |
| Explicit permission | Per-tool and/or per-session consent; show destination and scope. |
| Least privilege | Pass only selected notes/facts/ids—not entire vault by default. |
| No ambient sync | MCP grant ≠ sync grant. |
| Revocation | Immediate for future calls; disclose that past sends cannot be recalled. |
| Logging | Audit log entries for grants and invocations (tool id, scope, time). |
| Untrusted output | Treat tool output as untrusted input; sanitize before merge; mark provenance as MCP. |
| Network | User-visible indicator when a tool call leaves the device. |

---

## 9. Application security (engineering)

- Prefer memory-safe languages / strict TypeScript; sanitize Markdown rendering (XSS).
- CSP for PWA; no inline eval.
- Dependency pinning and periodic audit (`npm audit` / equivalent).
- Secrets only in keystore/env for any optional hosted components—never in the client vault format as plaintext provider credentials without encryption.
- Hosted sync (if any): store ciphertext blobs + account auth only; no server-side decryption path.

---

## 10. Telemetry & licensing (security-relevant)

- **No telemetry by default** — reduces exfiltration risk and attack surface.
- Optional anonymous stats: explicit opt-in only; no vault content; see `PRIVACY.md` / `LICENSING.md`.
- **MIT** license recommended for SelfChronicle — see `LICENSING.md`.
- Security-sensitive PRs (crypto, sync, MCP, telemetry) require heightened review before merge.

---

## 11. Incident & disclosure (project process)

- Prefer coordinated disclosure for vulnerabilities.
- `SECURITY.md` in repo root (or `.github/SECURITY.md`) should later state a contact path; this planning doc is the **model**, not the vulnerability reporting address.
- Crypto changes require an ADR and migration notes for existing vaults.

---

## 12. Related documents

- `PRIVACY.md` — user-facing privacy design, deletion, wellbeing disclaimers, telemetry.  
- `LICENSING.md` — MIT, CONTRIBUTING outline, FOSS expectations.  
- Architecture / import pipeline docs — must honor ciphertext-only sync and audit events on import.
