# Feature: profile-summary

> Standout Profile Summary — a short biographical highlight reel, not a clinical dossier or morality/IQ scorecard.

## Acceptance criteria

- ✅ Artifact: `vault/profile/summary.md` (+ optional standouts list)
- ✅ 5–12 standout cards max; each: label, one-line insight, layer source, links, `pinned`, `provisional`, `user_edited`
- ✅ Compile never silently overwrites user-edited / pinned cards
- ✅ Handoff: summary **on by default**; Evidence/Wellbeing/Morality/Cognition still opt-in
- ✅ Exclude by default: raw wellbeing scores, unreviewed inferences, tombstoned items, third-party PII
- ✅ Tone: warm, specific, provisional (“You often…”, “You’ve said…”)

## Smoke scenario

1. _Given_ three pinned standouts
2. _When_ user rebuilds summary
3. _Then_ pinned/user-edited cards survive; forgotten ids stay out

## Container map

| Layer | Path |
|-------|------|
| Logic | `examples/web/src/profile/summary.ts` |
| Tests | `examples/web/src/profile/summary.test.ts` |

## Notes

- APIs: `profile.summary.get` / `profile.summary.rebuild` (confirm required)
- Screens: PD-15 Profile Summary · PD-16 Standout editor/pin
