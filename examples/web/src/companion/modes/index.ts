export type CompanionMode = "day_close" | "getting_to_know_you" | "witness" | "encourage" | "biographer" | "handoff";
export function listModes(): CompanionMode[] {
  return ["day_close", "getting_to_know_you", "witness", "encourage", "biographer", "handoff"];
}
