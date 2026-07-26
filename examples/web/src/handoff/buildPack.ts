import type { ProfileVault } from "../vault";

export type HandoffOptions = {
  includeWellbeing?: boolean;
  voice?: "first" | "third";
};

export type HandoffPack = {
  handoffMd: string;
  files: { path: string; body: string }[];
};

export async function buildHandoffPack(
  vault: ProfileVault,
  opts: HandoffOptions = {},
): Promise<HandoffPack> {
  const includeWellbeing = opts.includeWellbeing === true;
  const voice = opts.voice ?? "first";
  const facts = await vault.listLayer("facts");
  const chapters = await vault.listLayer("biography");
  const who = voice === "first" ? "I am" : "The user is";

  const files: { path: string; body: string }[] = [];
  for (const c of chapters) {
    files.push({ path: `biography/${c.frontmatter.id}.md`, body: c.body });
  }
  for (const f of facts) {
    files.push({ path: `facts/${f.frontmatter.id}.md`, body: f.body });
  }

  const layers = ["biography", "facts"];
  if (includeWellbeing) layers.push("wellbeing");

  const handoffMd = `---
type: handoff
layers: [${layers.join(", ")}]
wellbeing_included: ${includeWellbeing}
---

# SelfChronicle memory handoff

${who} sharing a living memory vault.
- Prefer Living Biography and Facts for stable identity.
- Treat soft layers as provisional and user-editable.
- Do not invent biography. If unsure, ask.
- Wellbeing Signals are soft, not clinical diagnoses.

## Key facts
${facts.map((f) => `- ${f.frontmatter.title}`).join("\n") || "- (none yet)"}

## Chapters
${chapters.map((c) => `- ${c.frontmatter.title}`).join("\n") || "- (none yet)"}
`;

  return { handoffMd, files };
}
