# Feature: cognitive-attention-profile

> Self-reported attention bandwidth & style preferences — **not** IQ, ADHD claims, or clinical labels.

## Acceptance criteria

- ✅ Bands / preferences only (session length, context-switch tolerance, deep-work window, complexity preference, current load)
- ✅ No timed IQ tests, no ranking vs other users, no clinical diagnosis copy
- ✅ Fully disableable; default **excluded** from handoff
- ✅ Soft proxies only from user tags (e.g. Day Close “scattered day”) — never keystroke/IDE surveillance
- ✅ i18n: `cognition.*` disclaimer keys

## Smoke scenario

1. _Given_ Cognition hub (CG-01)
2. _When_ user sets bandwidth bands
3. _Then_ UI shows preference labels (not an intelligence number); layer stays out of handoff unless opted in

## Container map

| Layer | Path |
|-------|------|
| Logic | `examples/web/src/cognition/profile.ts` |
| View | `examples/web/src/components/cognition/CognitionView.ts` |
| Handoff | `examples/web/src/handoff/layers/optIn.ts` (default off) |
| Tests | co-located `*.test.ts` |

## Notes

- Vault path (planned): `vault/cognition/`
- APIs: `cognition.get` / `cognition.update` — user edits win
- Screens: CG-01 hub · CG-02 bandwidth preferences · LM-06 Getting-to-know-you (optional reflective items)
