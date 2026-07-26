import { describe, expect, it } from "vitest";
import { claudeAdapter } from "./adapters/claude";
import { geminiAdapter } from "./adapters/gemini";
import { gmailAdapter } from "./adapters/gmail";
import { grokAdapter } from "./adapters/grok";
import { metaAdapter } from "./adapters/meta";
import { whatsappAdapter } from "./adapters/whatsapp";

describe("import adapters batch", () => {
  it("parses grok/claude/gemini json arrays", async () => {
    const grok = await grokAdapter.parse(
      JSON.stringify({
        conversations: [
          {
            conversation: { id: "1", title: "G", create_time: "2026-07-26T00:00:00Z" },
            responses: [{ response: { sender: "human", message: "hi" } }],
          },
        ],
      }),
    );
    expect(grok.count).toBe(1);
    expect(grok.parser_version).toBe("grok_json_v2");
    expect(grok.items[0]?.body).toContain("human: hi");

    const claude = await claudeAdapter.parse(
      JSON.stringify([{ name: "C", chat_messages: [{ sender: "human", text: "hey" }] }]),
    );
    expect(claude.sampleTitles[0]).toBe("C");

    const gemini = await geminiAdapter.parse(JSON.stringify([{ title: "Ge", text: "q" }]));
    expect(gemini.count).toBe(1);
  });

  it("parses whatsapp txt, mbox, and meta dyi", async () => {
    const wa = await whatsappAdapter.parse("26/07/2026, 10:00 - Ada: Hello");
    expect(wa.count).toBe(1);

    const mail = await gmailAdapter.parse(
      "From me@x\nSubject: Hi\nDate: Sat, 26 Jul 2026 12:00:00 +0000\n\nBody\n",
    );
    expect(mail.sampleTitles[0]).toBe("Hi");

    const meta = await metaAdapter.parse(
      JSON.stringify({
        title: "Thread",
        messages: [{ sender_name: "Ada", content: "Yo" }],
        extra: true,
      }),
    );
    expect(meta.count).toBe(1);
  });
});
