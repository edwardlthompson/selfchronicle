# SelfChronicle

**Privacy-first, local-first personal memory and living biography.**

SelfChronicle turns user-initiated exports and notes into a vault you own—then surfaces a Living Biography, key facts, and an auditable timeline you can edit and selectively inject into any LLM.

FOSS under **MIT**. Primary client: installable **PWA** (`examples/web/`) plus a **Capacitor Android** debug wrapper (`app.selfchronicle.vault`).

## What works today

| Area | Behavior |
|------|----------|
| **First run** | Empty vault → **Welcome** source hub. No personal demo data ships in the app or APK. |
| **Local vault** | Markdown Evidence + Facts + Biography layers. **IndexedDB** persistence survives restarts; `ProfileVault` auto-flushes after writes. |
| **Import** | Parse → review → commit into one unified vault. All imports land in the same Evidence store with provenance tags (`import`, adapter name, `provisional`). |
| **Welcome outlets** | Public GitHub username fetch · personal site URL (**pointer only—no scrape**) · Drive pack JSON · ChatGPT/Claude paste · manual paste · full import catalog (Grok, Gemini takeout, WhatsApp, etc.) |
| **Profile** | Living Biography, compact **bio chips** (occupations/passions), Key Facts, On This Day, Insights, Audit search, Life Timeline |
| **Identity enrich** | User-initiated **IMDb/public page enrich** from linked URLs (Profile or Welcome). Consent-first; may fail in-browser (CORS) — link inference still works offline. |
| **Google Drive sync (in-app)** | Optional **Google Identity Services OAuth** from Settings; pack at `SelfChronicle/vault-pack.json`; merge is union-by-path, newer `updated_at` wins. Requires `VITE_GOOGLE_CLIENT_ID` (see below). **Not** the same as external Composio/MCP Drive backup tooling. |
| **Android** | Debug APK via Capacitor after `npm run build` — see [Android debug build](#android-debug-build). |
### Import sources (summary)

- **Public GitHub** — fetches public profile/repos for a username you enter.
- **Personal site URL** — stores the URL you provide as provisional Evidence; **does not fetch page content**.
- **Drive pack** — paste or upload `vault-pack.json` (same shape as Drive sync).
- **ChatGPT / Claude** — paste official export JSON.
- **Grok / xAI** — paste JSON from an export you **unzip first** (`grok_json_v2`; e.g. pick `prod-grok-backend.json` or a smaller pack). No in-app ZIP import.
- **LLM memory disclosure** — paste or pick a Grok/Gemini **Memory Disclosure Report** `.md`; review-before-commit into Evidence with provenance tags.
- **Manual paste** — any text; review before commit.
- **Import screen** — additional adapters (Gemini takeout, Gmail, WhatsApp, Meta, Discord, Slack, …) with export how-to links.

## Known limitations

Do not expect these yet:

- **No silent scraping** of personal sites or chats—exports and explicit paste only.
- **No default personal seed** in production builds (debug-only `VITE_DEBUG_SEED_IMPORT` / `?debugSeed=adb-reverse` for dev).
- **Drive sync is cleartext JSON** today—encryption (`age` packs) is planned, not shipped (Settings shows a provisional warning).
- **Drive does nothing** until you configure a Google OAuth Web client ID for in-app GIS sign-in.
- **External MCP/Composio Drive backup** is separate from in-app sync—different auth path and not wired to `ProfileVault` merge.
- **IMDb enrich** requires explicit user action; fetches can fail in-browser (CORS).
- **Grok ZIP** must be unzipped on your machine before import.

Roadmap and sprint board: [`BUILD_PLAN.md`](BUILD_PLAN.md).

## Principles

- Local-first by default (full value offline)
- FOSS — **MIT**; no proprietary SDKs in the production path
- You control export, delete, and audit of every item
- User-initiated import only—official exports, paste, or public GitHub metadata
- Optional cloud sync must not weaken honesty about what's stored (cleartext Drive pack until crypto lands)
- Evening **Day Close** ritual is opt-in
- Soft psychology / wellbeing layers are provisional and editable
- Companion trust through memory fidelity and honesty—not dark patterns

## Quick start (web)

```bash
cd examples/web
npm ci
npm run dev

```

Open the URL Vite prints (default `http://localhost:5173`). On an empty vault you land on Welcome.

Tests and production build:

```bash
npm test
npm run build
npm run preview

```

More detail: [`examples/web/README.md`](examples/web/README.md).

## Optional Google Drive sync

1. Copy [`examples/web/.env.example`](examples/web/.env.example) → `examples/web/.env.local`.
2. Create a **Google Cloud OAuth 2.0 Web client**; enable **Google Drive API**.
3. Set authorized JavaScript origins: `http://localhost:5173`, `capacitor://localhost`, `https://localhost`.
4. Set `VITE_GOOGLE_CLIENT_ID=` in `.env.local` and restart dev/build.

Sign in under **Settings → Google Drive**. Sync reads/writes `SelfChronicle/vault-pack.json` in the signed-in account. Vault namespaces: `local:default` until Drive sign-in, then `google:{sub}`.

## Android debug build

Requires JDK 21 and Android SDK. Full commands: [`examples/native/README.md`](examples/native/README.md).

```bash
cd examples/web
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug

```

APK: `examples/web/android/app/build/outputs/apk/debug/app-debug.apk` — sideload with `adb install -r …`. First launch shows Welcome on an empty vault (same as web).

## Vault architecture (current)

- **One namespace per profile** — `local:default` or `google:{sub}` after Drive bind.
- **One Evidence store** — every import path commits provisional Evidence; provenance is tags only, not separate silos.
- **Merge policy** (Drive / pack import) — union by file path; when both sides have a path, keep the document with the newer `updated_at`.

Design docs: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) · [`docs/PRIVACY.md`](docs/PRIVACY.md).

## Stack

| Surface | Path | Package |
|---------|------|---------|
| PWA (primary) | `examples/web/` | `selfchronicle-web` |
| Android (Capacitor) | `examples/web/android/` | wraps PWA `dist/` |
| MCP / tools host | `examples/node/` | `selfchronicle-mcp` |
Bootstrapped from [agent-project-bootstrap](https://github.com/edwardlthompson/agent-project-bootstrap) (see `.template-version`).

### MCP host (optional)

```bash
cd examples/node
npm ci
npm run dev

```

## Start here

| Doc | Purpose |
|-----|---------|
| [docs/START_HERE.md](docs/START_HERE.md) | Human + agent entry |
| [docs/PLANNING_INDEX.md](docs/PLANNING_INDEX.md) | Product design index |
| [BUILD_PLAN.md](BUILD_PLAN.md) | Sprint board |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design |
| [docs/PRIVACY.md](docs/PRIVACY.md) / [docs/SECURITY.md](docs/SECURITY.md) | Privacy & security |
| [AGENTS.md](AGENTS.md) | Cursor agent router |
**Do not commit** `.env`, `.env.local`, personal vault packs, or export dumps.

## License

MIT — see [LICENSE](LICENSE).
