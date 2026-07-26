import type { IdentityPatch } from "../../../profile/identityPatch";
import { parseGeminiReport } from "./parseGemini";
import { grokInjectedTable, grokMemoryBlock, parseGrokBullets } from "./parseGrok";
import {
  factsFromPatch,
  mergePatch,
  type MemoryDisclosureParse,
  type MemoryDisclosureVendor,
} from "./parseShared";

export type { MemoryDisclosureFact, MemoryDisclosureParse, MemoryDisclosureVendor } from "./parseShared";

function detectVendor(raw: string): MemoryDisclosureVendor {
  if (/Memory Disclosure Report:\s*xAI Grok/i.test(raw) || /\bxAI Grok\b/i.test(raw)) return "grok";
  if (/Memory Disclosure Report:\s*Gemini/i.test(raw)) return "gemini";
  if (/\.grok\/user_info\/memory\.md/i.test(raw)) return "grok";
  if (/User Correction Ledger|personal_context:retrieve/i.test(raw)) return "gemini";
  return "unknown";
}

function extractSubject(raw: string): string | undefined {
  return raw.match(/\*\*Subject:\*\*\s*(.+?)(?:\n|$)/i)?.[1]?.trim();
}

/** Parse Grok or Gemini memory disclosure markdown into identity + provisional facts. */
export function parseMemoryDisclosureMarkdown(raw: string): MemoryDisclosureParse {
  const vendor = detectVendor(raw);
  const subject = extractSubject(raw);
  let identity: IdentityPatch = {};

  if (vendor === "grok") {
    identity = mergePatch(identity, grokInjectedTable(raw));
    identity = mergePatch(identity, parseGrokBullets(grokMemoryBlock(raw)));
  } else if (vendor === "gemini") {
    identity = mergePatch(identity, parseGeminiReport(raw));
  }

  return { vendor, subject, identity, facts: factsFromPatch(vendor, identity) };
}

export function isMemoryDisclosureMarkdown(raw: string): boolean {
  return /Memory Disclosure Report:/i.test(raw.trim());
}
