/** Role-based context packs: which vault layers a handoff includes. */

export type RolePreset = "coding" | "personal" | "redacted";

export type HandoffLayer =
  | "biography"
  | "facts"
  | "values"
  | "people"
  | "curiosity"
  | "wellbeing";

export type RolePack = {
  preset: RolePreset;
  layers: HandoffLayer[];
};

const CODING: HandoffLayer[] = ["biography", "facts", "curiosity"];
const PERSONAL: HandoffLayer[] = [
  "biography",
  "facts",
  "values",
  "people",
  "curiosity",
];
const REDACTED: HandoffLayer[] = ["biography", "facts"];

export function packForRole(preset: RolePreset): RolePack {
  if (preset === "coding") return { preset, layers: [...CODING] };
  if (preset === "personal") return { preset, layers: [...PERSONAL] };
  return { preset: "redacted", layers: [...REDACTED] };
}

export function includesLayer(preset: RolePreset, layer: HandoffLayer): boolean {
  return packForRole(preset).layers.includes(layer);
}
