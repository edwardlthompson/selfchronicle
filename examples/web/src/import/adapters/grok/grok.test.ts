import { describe, expect, it } from "vitest";
import { grokAdapter, parseGrokExportData } from "./index";

const sampleExport = {
  conversations: [
    {
      conversation: {
        id: "c1",
        title: "Sample vault chat",
        create_time: "2026-07-26T00:00:00.000Z",
      },
      responses: [
        {
          response: {
            _id: "r1",
            sender: "human",
            message: "Hello from human",
            create_time: { $date: { $numberLong: "1785038095290" } },
          },
        },
        {
          response: {
            _id: "r2",
            sender: "assistant",
            message: "Hello from Grok",
          },
        },
      ],
    },
  ],
  projects: [],
  tasks: [],
  media_posts: [],
};

describe("grok xAI export adapter", () => {
  it("parses official nested conversations/responses shape", async () => {
    const review = await grokAdapter.parse(JSON.stringify(sampleExport));
    expect(review.parser_version).toBe("grok_json_v2");
    expect(review.count).toBe(1);
    expect(review.items[0]?.title).toBe("Sample vault chat");
    expect(review.items[0]?.body).toContain("human: Hello from human");
    expect(review.items[0]?.body).toContain("assistant: Hello from Grok");
    expect(review.items[0]?.source_id).toBe("c1");
    expect(review.items[0]?.occurred_at).toBe("2026-07-26T00:00:00.000Z");
  });

  it("returns empty for blank object", () => {
    expect(parseGrokExportData({})).toEqual([]);
  });
});
