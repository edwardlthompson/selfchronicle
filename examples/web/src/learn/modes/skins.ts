/** Learning Mode session skins — Witness / Encourage. */

export type SessionSkinId = "witness" | "encourage";

export type SessionSkin = {
  id: SessionSkinId;
  title: string;
  promptTone: string;
  /** Soft guidance; never guilt or loneliness hooks. */
  companionHint: string;
  allowsSkip: true;
};

export const WITNESS_SKIN: SessionSkin = {
  id: "witness",
  title: "Witness",
  promptTone: "Listen and reflect without fixing.",
  companionHint: "I am here as an AI witness — your words stay yours.",
  allowsSkip: true,
};

export const ENCOURAGE_SKIN: SessionSkin = {
  id: "encourage",
  title: "Encourage",
  promptTone: "Warm agency — notice strengths, invite next small step.",
  companionHint: "I am an AI companion cheering your agency, not replacing people.",
  allowsSkip: true,
};

const SKINS: Record<SessionSkinId, SessionSkin> = {
  witness: WITNESS_SKIN,
  encourage: ENCOURAGE_SKIN,
};

export function getSkin(id: SessionSkinId): SessionSkin {
  return SKINS[id];
}

export function listSkins(): SessionSkin[] {
  return [WITNESS_SKIN, ENCOURAGE_SKIN];
}

export function applySkinPrompt(skin: SessionSkin, question: string): string {
  return `[${skin.title}] ${skin.promptTone}\n\n${question}`;
}
