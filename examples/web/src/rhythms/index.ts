export type Rhythm = { name: string; confirmed: boolean };
export function softRhythms(): Rhythm[] {
  return [{ name: "evening wind-down", confirmed: false }];
}
