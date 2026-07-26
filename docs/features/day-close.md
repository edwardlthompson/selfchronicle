# Feature: day-close

## Acceptance criteria

- ✅ Opt-in settings: enabled, bedtime window start/end, snooze minutes
- ✅ Max **3** questions per ritual (hard cap)
- ✅ Optional free-form recap + skippable questions
- ✅ Commit answers to Evidence (`source: day_close`, `channel: journal`)
- ✅ Skip / snooze / suppress when Focus Mode flag set
- ✅ Warm good-night close copy
- 🔲 Local notifications (permissioned) — later

## Settings model

```ts
{ enabled: false, windowStart: "21:00", windowEnd: "23:30", snoozeMinutes: 20, focusMode: false, maxQuestions: 3 }
```

## Smoke

1. Enable Day Close → Begin → write recap → skip questions → Saved to Evidence
