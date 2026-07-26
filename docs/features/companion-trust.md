# Feature: companion-trust

> Earn trust through memory fidelity, humility, and care — not manipulation or fake humanity.

## Acceptance criteria

- ✅ Persistent honest AI disclosure in companion surfaces
- ✅ No dark patterns (“I’ll be lonely”); easy export/wipe
- ✅ Forgetfulness as respect — tombstones stay gone
- ✅ User edits win; repair after corrections
- ✅ No jealousy of humans; never compete with real relationships
- ✅ Local loyalty — intimate content stays in vault unless user handoffs

## Companion Trust principles (constitution)

1. Remember accurately; admit gaps; never invent biography
2. User edits win; repair ritual after corrections
3. Consent gradients (deep topics in Learning / invite only)
4. Vulnerable with boundaries — honest AI limits; no fake embodied life
5. Empathy then agency; encourage without toxic positivity
6. Continuity via callbacks + On This Day with provenance
7. Forgetfulness as respect (tombstones stay gone)
8. No jealousy of humans; never compete with real relationships
9. No dark patterns (“I’ll be lonely”); easy export/wipe
10. Local loyalty — intimate content stays in vault unless user handoffs

## Smoke scenario

1. _Given_ Relationship charter (CT-01)
2. _When_ user opens companion mode picker
3. _Then_ AI disclosure is visible and loneliness-guilt copy is absent

## Container map

| Layer | Path |
|-------|------|
| Charter | `examples/web/src/companion/charter.ts` |
| Trust ledger | `examples/web/src/companion/trustLedger.ts` |
| Session skins | `examples/web/src/learn/modes/skins.ts` |
| Tests | co-located `*.test.ts` |

## Notes

- Modes: Day Close · Getting-to-know-you · Witness · Encourage · Biographer · Handoff voice
- Screens: CT-01 charter · CT-02 mode picker · CT-03 callback · CT-04 repair
