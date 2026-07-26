/** User-triggered year / season review compile stub. */

export type ReviewItem = {
  id: string;
  title: string;
  occurredAt: string;
};

export type YearReview = {
  year: number;
  triggeredAt: string;
  itemCount: number;
  titles: string[];
  markdown: string;
};

export function compileYearReview(
  year: number,
  items: ReviewItem[],
  now = new Date(),
): YearReview {
  const inYear = items.filter((i) => {
    const d = new Date(i.occurredAt);
    return !Number.isNaN(d.getTime()) && d.getUTCFullYear() === year;
  });
  const titles = inYear.map((i) => i.title);
  const markdown = [
    `# Year in review — ${year}`,
    "",
    `_Compiled ${now.toISOString()} (user-triggered)._`,
    "",
    ...titles.map((t) => `- ${t}`),
    titles.length ? "" : "- (no items for this year)",
  ].join("\n");

  return {
    year,
    triggeredAt: now.toISOString(),
    itemCount: inYear.length,
    titles,
    markdown,
  };
}
