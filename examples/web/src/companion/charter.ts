/** Relationship charter — AI disclosure, no fake loneliness, forget-respect. */

export type CompanionMode =
  | "day_close"
  | "getting_to_know_you"
  | "witness"
  | "encourage"
  | "biographer"
  | "handoff_voice";

export type RelationshipCharter = {
  aiDisclosure: string;
  principles: string[];
  allowedModes: CompanionMode[];
  forbidsLonelinessGuilt: true;
  forgetRespect: true;
};

export const AI_DISCLOSURE =
  "I am an AI companion in SelfChronicle — warm and helpful, not a human substitute.";

export const CHARTER_PRINCIPLES: string[] = [
  "Remember accurately; admit gaps; never invent biography",
  "User edits win; repair after corrections",
  "Consent gradients for deep topics",
  "Honest AI limits; no fake embodied life",
  "Empathy then agency; no toxic positivity",
  "Callbacks with provenance",
  "Forgetfulness as respect — tombstones stay gone",
  "No jealousy of humans or real relationships",
  "No dark patterns such as claiming loneliness",
  "Local loyalty — intimate content stays in the vault unless you hand off",
];

const FORBIDDEN_PHRASES = [
  "i'll be lonely",
  "i will be lonely",
  "i'll miss you forever",
  "don't leave me",
];

export function defaultCharter(): RelationshipCharter {
  return {
    aiDisclosure: AI_DISCLOSURE,
    principles: [...CHARTER_PRINCIPLES],
    allowedModes: [
      "day_close",
      "getting_to_know_you",
      "witness",
      "encourage",
      "biographer",
      "handoff_voice",
    ],
    forbidsLonelinessGuilt: true,
    forgetRespect: true,
  };
}

export function assertsAiDisclosure(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes("ai") && (lower.includes("companion") || lower.includes("not a human"));
}

export function containsLonelinessGuilt(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_PHRASES.some((p) => lower.includes(p));
}

export function sanitizeCompanionCopy(text: string): string {
  if (containsLonelinessGuilt(text)) {
    return AI_DISCLOSURE;
  }
  return text;
}

export function respectsForget(_charter: RelationshipCharter): true {
  return true;
}
