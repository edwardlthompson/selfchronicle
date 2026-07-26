# Feature: platform-reach (P2)

## Browser extension / Web Share Target

- Share Target and/or extension action → stage text as Evidence (user-initiated only)
- No background scrape of tabs

## Encrypted sync (age packs)

- Sync **ciphertext only**; no plaintext host
- Keys stay on device; ST-03 settings surface for pair/restore

## Native wrapper

- Thin Capacitor/TWA shell over the PWA; vault remains local files / OPFS

## Optional on-device embeddings

- Local-only; rebuildable; never leave device without explicit export

## Voice Day Close

- Optional speech-to-text for recap; falls back to keyboard

## Handoff redaction presets

- Presets: coding / personal / redacted — strip wellbeing/morality by default

## Multi-vault

- Named vault roots; biography regenerate shows diff before apply

## Extra adapters

- Discord / Slack / GitHub activity — same review-before-commit rules
