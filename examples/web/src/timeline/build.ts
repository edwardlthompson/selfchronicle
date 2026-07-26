import type { VaultDocument } from "../vault";

export type TimelineNode = {
  id: string;
  title: string;
  when: string;
  type: string;
  path: string;
};

export function buildTimeline(docs: VaultDocument[]): TimelineNode[] {
  return [...docs]
    .sort((a, b) => a.frontmatter.created_at.localeCompare(b.frontmatter.created_at))
    .map((d) => ({
      id: d.frontmatter.id,
      title: d.frontmatter.title,
      when: d.frontmatter.created_at.slice(0, 10),
      type: d.frontmatter.type,
      path: d.path,
    }));
}

/** Narrative insight — never a shame streak or clinical score. */
export function buildStatStory(docs: VaultDocument[]): string {
  if (docs.length === 0) {
    return "Your timeline is ready whenever you want to capture a moment.";
  }
  const types = new Set(docs.map((d) => d.frontmatter.type));
  const themes: string[] = [];
  if (types.has("evidence")) themes.push("lived notes");
  if (types.has("fact")) themes.push("key facts");
  if (types.has("biography_chapter")) themes.push("biography chapters");
  const themeText = themes.length ? themes.join(", ") : "personal memory";
  return `You’ve been gathering ${themeText} — a calm record you own.`;
}
