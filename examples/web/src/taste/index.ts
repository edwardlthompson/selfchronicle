export type TasteSig = { domain: string; note: string };
export function tasteAtlas(): TasteSig[] {
  return [{ domain: "music", note: "User-curated" }];
}
