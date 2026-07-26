import type { ProfileVault } from "../vault";
import { distillAndPersistBio } from "../profile/bioVault";
import type { ImportReview } from "./types";

export async function commitImportReview(
  vault: ProfileVault,
  review: ImportReview,
): Promise<{ committed: number }> {
  let committed = 0;
  const tagExtra =
    review.adapter === "memory_disclosure"
      ? [review.vendor === "grok" ? "grok_memory" : review.vendor === "gemini" ? "gemini_memory" : "llm_memory"]
      : [];
  for (const item of review.items) {
    await vault.appendEvidence({
      title: item.title,
      body: item.body,
      tags: ["import", review.adapter, "provisional", ...tagExtra],
      source: review.adapter as never,
      channel: "llm_chat",
      occurred_at: item.occurred_at,
    });
    committed += 1;
  }
  if (review.layerFacts?.length) {
    for (const fact of review.layerFacts) {
      await vault.upsertLayer("facts", fact.title, fact.body);
    }
  }
  await distillAndPersistBio(vault);
  return { committed };
}
