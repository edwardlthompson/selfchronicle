export type VoiceGuide = { humor: string; narrative: string };
export function defaultVoice(): VoiceGuide {
  return { humor: "dry-warm", narrative: "first-person provisional" };
}
