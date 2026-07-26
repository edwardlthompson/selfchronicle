# SelfChronicle — Licensing & FOSS Policy

> **Status:** Planning document.  
> Bootstrap / template license is MIT; SelfChronicle adopts the same unless a future ADR records a change.

---

## 1. Recommended license: MIT

**Decision:** Use the **MIT License** for SelfChronicle application code and first-party documentation in this repository.

### Why MIT

- Matches the bootstrap template; lowest friction for contributors and downstream forks.
- Permissive FOSS: use, copy, modify, merge, publish, distribute, sublicense, sell—with copyright and license notice retained.
- Privacy-/security-critical software benefits from wide review; permissive licensing encourages that without copyleft compliance burden for embedders.
- No strong reason (patent pool, strong copyleft ecosystem dependency, etc.) currently justifies GPL/Apache-2.0-only instead. Apache-2.0 remains an acceptable alternative if patent grants become a project priority later—an ADR would be required to switch.

### Scope notes

- Third-party dependencies keep their own licenses; maintain a NOTICE or equivalent if required.
- User vault content is **not** licensed to the project; it remains the user’s data.
- Trademark / name “SelfChronicle” may be reserved separately from code license (optional future policy).

---

## 2. Telemetry (FOSS product defaults)

| Policy | Default |
|--------|---------|
| Telemetry / phone-home | **Disabled** |
| Anonymous usage statistics | **Disabled**; only with **explicit opt-in** |
| Vault content in any analytics | **Forbidden** |
| Contributions that add silent networking of usage or content | **Reject** unless design-reviewed and opt-in UX is complete |

Rationale: aligns with privacy-first positioning and reduces accidental data exfiltration. Details in `PRIVACY.md`.

---

## 3. What `CONTRIBUTING.md` should say (outline)

When adding root `CONTRIBUTING.md`, align with the template CONTRIBUTING if present, and include at least:

1. **Welcome & Code of Conduct** — pointer to CoC (Contributor Covenant or template default).
2. **How to develop** — prerequisites, install, test, lint (fill when stack is fixed).
3. **PR process** — small focused PRs; link issues; maintainers may request changes.
4. **Privacy & security expectations**
   - No telemetry or plaintext cloud upload without explicit product design and user opt-in.
   - Crypto, sync, MCP, and auth changes need extra review (reference `SECURITY.md`).
   - Never commit secrets, real vault samples with personal data, or production keys.
5. **Licensing of contributions** — contributions accepted under MIT; contributors affirm they have the right to submit.
6. **Issue hygiene** — how to report bugs vs. vulnerabilities (vulns → security contact / coordinated disclosure, not public issue if exploitable).
7. **Docs & planning** — prefer updating `docs/*` when behavior changes; do not thrash owned docs without coordination.
8. **Style** — match existing code; no drive-by dependency or formatter wars.

Until `CONTRIBUTING.md` exists, this outline is the planning source of truth.

---

## 4. Related documents

- `PRIVACY.md` — privacy design and telemetry user promises.  
- `SECURITY.md` — threat model, encryption, MCP boundaries, review expectations for sensitive PRs.
