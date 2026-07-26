# Feature: focus-quiet

- ✅ Explicit Focus Mode toggle (user-owned; **no IDE hooks / no scrape**)
- ✅ Quiet hours window suppresses Day Close cues
- ✅ SH-02 Focus chip + SH-03 Quiet banner when suppressed
- ✅ Day Close `shouldOffer` respects focus + quiet + existing opt-in/window/snooze

## Hard rules

- Never inject overlays into other apps or steal focus from coding tools
- Prefer OS DND / user Focus toggle / schedule windows only
