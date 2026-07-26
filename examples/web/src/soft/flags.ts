/** Soft-layer flags: always provisional unless user locks. */

export type SoftLayerKind = "personality" | "wellbeing";

export type SoftDoc = {
  kind: SoftLayerKind;
  title: string;
  body: string;
  provisional: boolean;
  enabled: boolean;
  disclaimer: string;
  user_edited: boolean;
};

export const PERSONALITY_DISCLAIMER =
  "Personality notes are provisional reflections you can edit or delete — not a diagnosis.";

export const WELLBEING_DISCLAIMER =
  "Wellbeing signals are soft, optional, and never clinical. Disable anytime.";

export function defaultPersonality(): SoftDoc {
  return {
    kind: "personality",
    title: "Personality summary",
    body: "Curious, reflective, values ownership of their own story.",
    provisional: true,
    enabled: true,
    disclaimer: PERSONALITY_DISCLAIMER,
    user_edited: false,
  };
}

export function defaultWellbeing(): SoftDoc {
  return {
    kind: "wellbeing",
    title: "Wellbeing signals",
    body: "No active signals. Enable only if you want gentle trend notes.",
    provisional: true,
    enabled: false,
    disclaimer: WELLBEING_DISCLAIMER,
    user_edited: false,
  };
}

const P_KEY = "sc.soft.personality";
const W_KEY = "sc.soft.wellbeing";

export function loadSoft(kind: SoftLayerKind): SoftDoc {
  const key = kind === "personality" ? P_KEY : W_KEY;
  const fallback = kind === "personality" ? defaultPersonality() : defaultWellbeing();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as SoftDoc), provisional: true };
  } catch {
    return fallback;
  }
}

export function saveSoft(doc: SoftDoc): void {
  const key = doc.kind === "personality" ? P_KEY : W_KEY;
  localStorage.setItem(key, JSON.stringify({ ...doc, provisional: true }));
}
