import type { ImportAdapter, ParsedItem } from "../../types";
import { thinReview } from "../shared";

/** WhatsApp export: `_chat.txt` style lines `DD/MM/YYYY, HH:MM - Name: message`. */
export const whatsappAdapter: ImportAdapter = {
  sourceKey: "whatsapp_export",
  parser_version: "whatsapp_txt_v1",
  guideSteps: [
    "WhatsApp → Chat → Export chat (without media preferred)",
    "Save the .txt on this device",
    "Paste into Import → WhatsApp",
  ],
  async parse(raw: string) {
    const lines = raw.split(/\r?\n/).filter((l) => l.trim());
    const body = lines.slice(0, 500).join("\n");
    const titleMatch = lines.find((l) => /^- /.test(l)) ?? "WhatsApp chat";
    const items: ParsedItem[] = [
      {
        title: titleMatch.slice(0, 80),
        body: body || "_Empty WhatsApp export_",
      },
    ];
    return thinReview({
      sourceKey: whatsappAdapter.sourceKey,
      parser_version: whatsappAdapter.parser_version,
      knownKeys: [],
      items,
    });
  },
};
