# Threat Model — SelfChronicle

> Product threat model. Complements `docs/SECURITY.md` and root `SECURITY.md`. Link tasks in `BUILD_PLAN.md`.

## Scope

| Item | Value |
|------|-------|
| Project | SelfChronicle |
| Stack | Web/PWA (Vite + TypeScript) + Node MCP host; local Markdown/YAML vault |
| Methodology | STRIDE; OWASP ASVS for web; privacy threats for local-first vaults |
## Trust Boundaries

```text
[User] --> [PWA / local UI] --> [Vault files + SQLite index]
                |                      |
         Optional age sync        [User-owned cloud: ciphertext only]
                |
         [MCP host / CLI] --grant--> same vault (scoped, audited)
                |
         [External LLM] <-- only via explicit handoff paste/files

```

- **Trusted:** user device, vault directory, keys in platform keystore / Argon2id-derived material
- **Untrusted:** sync providers, external LLMs, MCP clients until granted, import archives from third parties

## STRIDE Summary

| Threat | Example | Mitigation | Owner |
|--------|---------|------------|-------|
| Spoofing | Fake MCP client | Explicit grants, short sessions, local bind | AGENT |
| Tampering | Modified vault / index | Files SoT; rebuild index; optional AEAD on sensitive sections | AGENT |
| Repudiation | Denied import/MCP write | Append-only audit log | AGENT |
| Information disclosure | Sync provider reads vault | age ciphertext-only; handoff warnings | AGENT |
| Denial of service | Huge Takeout zip | Stream parse, size limits, review-before-commit | AGENT |
| Elevation of privilege | MCP write without confirm | Per-action confirm on writes; default deny | AGENT |
## Top Abuse Cases

1. MCP or agent exfiltrates vault beyond granted scope
2. User pastes full Evidence/Wellbeing into a cloud LLM unintentionally
3. Import archive includes third-party PII committed without review
4. Supply-chain compromise via malicious dependency
5. Silent scraping / background chat capture (forbidden by product principles)
6. Soft psychology layers misread as clinical diagnosis
7. Parasocial dark patterns or fake humanity claims

## Security Tasks

See `docs/SECURITY.md`, Sprint 0–13 privacy acceptance in `BUILD_PLAN.md`, and weekly `docs/SECURITY_TRIAGE.md`.

## Review Cadence

- `[HUMAN]` Review at each milestone boundary
- `[AGENT]` Update when architecture or data flows change (append ADR reference)
