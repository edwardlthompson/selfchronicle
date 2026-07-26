export type CraftIdentity = { label: string; notes: string };
export function defaultIdentity(): CraftIdentity {
  return { label: "Maker", notes: "User-written craft identity." };
}
