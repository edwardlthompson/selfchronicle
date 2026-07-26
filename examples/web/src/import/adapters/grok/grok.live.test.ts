import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ProfileVault } from "../../../vault";
import { commitImportReview } from "../../commit";
import { grokAdapter } from "./index";

const LIVE =
  process.env.GROK_EXPORT_JSON ??
  "c:/Users/edwar/Downloads/grok-export-unpacked/ttl/30d/export_data/c8c8265a-0024-4fa4-944b-4468627d047a/prod-grok-backend.json";

describe("grok live export (optional)", () => {
  it("parses and commits the user's xAI dump when present", async () => {
    if (!existsSync(LIVE)) {
      console.warn("skip live grok import — file missing:", LIVE);
      return;
    }
    const raw = readFileSync(LIVE, "utf8");
    const review = await grokAdapter.parse(raw);
    expect(review.count).toBeGreaterThan(100);
    expect(review.sampleTitles.length).toBeGreaterThan(0);
    expect(review.items[0]?.body.length).toBeGreaterThan(0);

    const vault = new ProfileVault();
    await vault.open("memory://grok-import-test");
    const { committed } = await commitImportReview(vault, review);
    expect(committed).toBe(review.count);

    const evidence = await vault.listEvidence();
    expect(evidence.length).toBe(review.count);

    // Profile-facing summary fact
    await vault.upsertLayer(
      "facts",
      "Grok / xAI archive",
      `Imported ${committed} Grok conversations from official xAI data export (${new Date().toISOString().slice(0, 10)}). Provisional Evidence in vault.`,
    );
    const facts = await vault.listLayer("facts");
    expect(facts.some((f) => f.frontmatter.title === "Grok / xAI archive")).toBe(true);

    // Write a mobile-friendly pack (titles + truncated bodies already in review)
    const packPath =
      process.env.GROK_PACK_OUT ??
      "c:/Users/edwar/Downloads/selfchronicle-grok-pack.json";
    const pack = {
      evidence: review.items.map((i) => ({
        title: i.title,
        body: i.body,
        tags: ["import", "grok_export", "provisional"],
      })),
      chapters: [],
      facts: [
        {
          title: "Grok / xAI archive",
          body: `Imported ${committed} Grok conversations from official xAI data export.`,
        },
      ],
    };
    const { writeFileSync } = await import("node:fs");
    writeFileSync(packPath, JSON.stringify(pack), "utf8");
    console.log("wrote pack", packPath, "conversations", committed);
  }, 120_000);
});
