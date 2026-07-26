/** Local FOSS coach prompt library — no cloud calls. */

export type CoachPrompt = {
  id: string;
  title: string;
  body: string;
  tags: string[];
};

const LIBRARY: CoachPrompt[] = [
  {
    id: "reflect-day",
    title: "Reflect on the day",
    body: "What mattered today? What would you keep, change, or leave out?",
    tags: ["day-close", "reflect"],
  },
  {
    id: "clarify-decision",
    title: "Clarify a decision",
    body: "Name the options, the tradeoff, and the principle that tips the scale.",
    tags: ["decision", "values"],
  },
  {
    id: "curiosity-thread",
    title: "Follow a curiosity thread",
    body: "Pick one open question from your vault and write three next steps.",
    tags: ["curiosity", "learn"],
  },
];

export function listPrompts(tag?: string): CoachPrompt[] {
  if (!tag) return LIBRARY.map((p) => ({ ...p, tags: [...p.tags] }));
  return LIBRARY.filter((p) => p.tags.includes(tag)).map((p) => ({
    ...p,
    tags: [...p.tags],
  }));
}

export function getPrompt(id: string): CoachPrompt | undefined {
  const found = LIBRARY.find((p) => p.id === id);
  return found ? { ...found, tags: [...found.tags] } : undefined;
}

/** Explicit: prompts are local-only; never fetch from a coach API. */
export function isLocalOnly(): true {
  return true;
}
