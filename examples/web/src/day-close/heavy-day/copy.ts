/**
 * Heavy-day Day Close copy — supportive, non-clinical.
 * Not therapy. No diagnosis language.
 */

export type HeavyDayCopy = {
  heading: string;
  body: string;
  notePrompt: string;
  resourcesLabel: string;
  resourcesHref: string;
};

export const HEAVY_DAY_COPY: HeavyDayCopy = {
  heading: "A heavier day",
  body: "You do not have to capture everything. One short note is enough. Be kind to yourself tonight.",
  notePrompt: "Optional note (one thought is fine)",
  resourcesLabel: "Helpful resources",
  resourcesHref: "https://www.iasp.info/suicidalthoughts/",
};

const BANNED = [
  "diagnos",
  "disorder",
  "therap",
  "clinical",
  "psychiatr",
  "depressi",
  "anxiety disorder",
  "adhd",
  "bipolar",
  "ptsd",
  "medication",
  "treatment plan",
];

/** Returns banned substrings found (empty = pass). */
export function findClinicalLanguage(text: string): string[] {
  const lower = text.toLowerCase();
  return BANNED.filter((w) => lower.includes(w));
}

export function heavyDayStrings(): string[] {
  const c = HEAVY_DAY_COPY;
  return [c.heading, c.body, c.notePrompt, c.resourcesLabel];
}
