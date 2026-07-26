import {
  shouldOfferDayClose,
  type DayCloseSettings,
} from "../day-close/settings";
import { cuesSuppressed, type FocusQuietSettings } from "./settings";

/** Day Close cue only when DC settings allow and focus/quiet do not suppress. */
export function shouldOfferCue(
  dayClose: DayCloseSettings,
  focusQuiet: FocusQuietSettings,
  snoozeUntilMs: number | null,
  now = new Date(),
): boolean {
  if (cuesSuppressed(focusQuiet, now)) return false;
  return shouldOfferDayClose(dayClose, snoozeUntilMs, now);
}
