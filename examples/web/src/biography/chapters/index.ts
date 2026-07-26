export type ChapterEra = { id: string; title: string; era: string };
export function listChapters(): ChapterEra[] {
  return [{ id: "ch1", title: "Beginnings", era: "early" }];
}
