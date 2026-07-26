/** Optional voice → text for Day Close recap; keyboard remains primary. */

export type VoiceRecapResult = { text: string; source: "voice" | "keyboard" };

export function voiceSupported(): boolean {
  return typeof window !== "undefined" && "webkitSpeechRecognition" in window;
}

export async function captureRecapFallback(keyboardText: string): Promise<VoiceRecapResult> {
  return { text: keyboardText.trim(), source: "keyboard" };
}
