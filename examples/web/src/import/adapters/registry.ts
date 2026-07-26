import type { ImportAdapter } from "../types";
import { chatgptAdapter } from "./chatgpt";
import { claudeAdapter } from "./claude";
import { discordAdapter } from "./discord";
import { geminiAdapter } from "./gemini";
import { githubAdapter } from "./github";
import { gmailAdapter } from "./gmail";
import { grokAdapter } from "./grok";
import { memoryDisclosureAdapter } from "./memoryDisclosure";
import { metaAdapter } from "./meta";
import { pasteAdapter } from "./paste";
import { slackAdapter } from "./slack";
import { whatsappAdapter } from "./whatsapp";

/** formatKey → adapter (must match ImportSourcesCatalog). */
const BY_FORMAT: Record<string, ImportAdapter> = {
  chatgpt_json: chatgptAdapter,
  claude_export: claudeAdapter,
  grok_json: grokAdapter,
  gemini_takeout: geminiAdapter,
  gmail_takeout: gmailAdapter,
  whatsapp_txt: whatsappAdapter,
  meta_dyi: metaAdapter,
  discord_json: discordAdapter,
  slack_json: slackAdapter,
  github_activity_json: githubAdapter,
  memory_disclosure_md: memoryDisclosureAdapter,
  manual_paste: pasteAdapter,
};

export function getAdapterForFormat(formatKey: string): ImportAdapter {
  return BY_FORMAT[formatKey] ?? pasteAdapter;
}

export function registeredFormatKeys(): string[] {
  return Object.keys(BY_FORMAT);
}
