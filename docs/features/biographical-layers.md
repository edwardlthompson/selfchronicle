# Feature: biographical-layers

> Deeper biographical scaffolding — chapters, turning points, taste atlas — user-curated, provisional where inferred.

## Acceptance criteria

- ✅ Life chapters / eras stubs with stable ids
- ✅ Turning points linkable to Evidence/Facts
- ✅ Taste atlas stubs (signatures, not surveillance)
- ✅ Places & relationships curated only (never OS contacts scrape)
- ✅ Hard/grief chapters private by default (future depth)

## Smoke scenario

1. _Given_ biographical layer stubs
2. _When_ user adds a chapter and a turning point
3. _Then_ ids persist and can feed Profile Summary compile sources

## Container map

| Layer | Path |
|-------|------|
| Logic | `examples/web/src/bio/layers.ts` |
| Tests | `examples/web/src/bio/layers.test.ts` |

## Notes

- Planned vault paths: chapters, turning_points, taste_atlas under biography depth
- APIs: `chapters.*`, `turning_points.*`, `taste_atlas.*`
- Screens: BL-01 Chapters · BL-02 Turning points · BL-03 Taste atlas
