# Feature: morality-matrix

> Provisional soft layer — **not** a moral judgment score. Describes priorities the user endorses.

## Acceptance criteria

- ✅ Axes are configurable priorities (care, fairness, loyalty, authority, liberty, honesty, long-termism) — never a single “morality score”
- ✅ Each axis: self-placement, optional why, `confidence`, `user_edited`, `status: provisional`
- ✅ Fully user-editable / disableable; excluded from handoff unless opted in
- ✅ UI copy: “How you describe what matters to you” — never “how moral you are”
- ✅ Learning Mode Getting-to-know-you may ask **max 3** morality questions; skip always available
- ✅ i18n: `morality.*` disclaimer keys

## Smoke scenario

1. _Given_ Profile / Morality hub (MM-01)
2. _When_ user places an axis and saves
3. _Then_ matrix persists with `provisional` + `user_edited`; no aggregate score is shown

## Container map

| Layer | Path |
|-------|------|
| Logic | `examples/web/src/morality/matrix.ts` |
| View | `examples/web/src/components/morality/MatrixView.ts` |
| Session | `examples/web/src/learn/getting-to-know-you/session.ts` |
| Handoff | `examples/web/src/handoff/layers/optIn.ts` (default off) |
| Tests | co-located `*.test.ts` |

## Notes

- Vault path (planned): `vault/morality/`
- APIs: `morality.get` / `morality.update` — never auto-publish from Evidence without review
- Screens: MM-01 hub · MM-02 axis editor · MM-03 question card
