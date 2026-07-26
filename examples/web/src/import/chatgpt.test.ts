import { describe, expect, it } from "vitest";
import { chatgptAdapter } from "./adapters/chatgpt";
import { pasteAdapter } from "./adapters/paste";
import { commitImportReview } from "./commit";
import { ProfileVault } from "../vault";

describe("import adapters", () => {
  it("parses ChatGPT conversations.json array", async () => {
    const raw = JSON.stringify([
      {
        id: "c1",
        title: "Career chat",
        create_time: 1700000000,
        mapping: {
          a: {
            message: {
              author: { role: "user" },
              content: { parts: ["Hello"] },
            },
          },
        },
      },
    ]);
    const review = await chatgptAdapter.parse(raw);
    expect(review.parser_version).toBe("chatgpt_export_v1");
    expect(review.count).toBe(1);
    expect(review.items[0]?.body).toContain("Hello");
  });

  it("paste adapter commits one evidence note", async () => {
    const review = await pasteAdapter.parse("Title line\n\nBody");
    const vault = new ProfileVault();
    await vault.open();
    const { committed } = await commitImportReview(vault, review);
    expect(committed).toBe(1);
    expect((await vault.listEvidence())[0]?.frontmatter.provenance.source).toBe(
      "manual_paste",
    );
  });
});
