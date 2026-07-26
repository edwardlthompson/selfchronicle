/** Cognitive / attention profile — bands & preferences only; no IQ number. */

export type LoadBand = "low" | "medium" | "high";
export type ThreadPref = "one_thread" | "few_threads" | "many_ok";
export type FormPref = "short" | "mixed" | "long_form_ok";

export type CognitionProfile = {
  provisional: boolean;
  enabled: boolean;
  /** Preference bands — never marketed as intelligence. */
  sessionLengthMin: number;
  contextSwitchTolerance: "low" | "medium" | "high";
  deepWorkWindow: string;
  complexityPref: FormPref;
  threadPref: ThreadPref;
  currentLoad: LoadBand;
  user_edited: boolean;
  disclaimer: string;
};

export const COGNITION_DISCLAIMER =
  "Attention preferences you choose — bands and style notes only. Not an IQ score, ADHD claim, or clinical assessment.";

const KEY = "sc.cognition.profile";

export function defaultProfile(): CognitionProfile {
  return {
    provisional: true,
    enabled: true,
    sessionLengthMin: 45,
    contextSwitchTolerance: "medium",
    deepWorkWindow: "morning",
    complexityPref: "mixed",
    threadPref: "one_thread",
    currentLoad: "medium",
    user_edited: false,
    disclaimer: COGNITION_DISCLAIMER,
  };
}

export function getProfile(): CognitionProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProfile();
    return {
      ...defaultProfile(),
      ...(JSON.parse(raw) as CognitionProfile),
      provisional: true,
      disclaimer: COGNITION_DISCLAIMER,
    };
  } catch {
    return defaultProfile();
  }
}

export function updateProfile(
  profile: CognitionProfile,
  patch: Partial<
    Pick<
      CognitionProfile,
      | "sessionLengthMin"
      | "contextSwitchTolerance"
      | "deepWorkWindow"
      | "complexityPref"
      | "threadPref"
      | "currentLoad"
      | "enabled"
    >
  >,
): CognitionProfile {
  return {
    ...profile,
    ...patch,
    provisional: true,
    user_edited: true,
    disclaimer: COGNITION_DISCLAIMER,
  };
}

export function saveProfile(profile: CognitionProfile): void {
  localStorage.setItem(
    KEY,
    JSON.stringify({ ...profile, provisional: true, disclaimer: COGNITION_DISCLAIMER }),
  );
}

/** Explicit non-API: this layer never exposes an IQ numeric score. */
export function iqScore(_profile: CognitionProfile): null {
  return null;
}

export function bandLabels(profile: CognitionProfile): string[] {
  const threads =
    profile.threadPref === "one_thread"
      ? "Prefers one thread"
      : profile.threadPref === "few_threads"
        ? "Few threads OK"
        : "Many threads OK";
  const form =
    profile.complexityPref === "long_form_ok"
      ? "Long-form OK"
      : profile.complexityPref === "short"
        ? "Short bursts"
        : "Mixed length";
  const load =
    profile.currentLoad === "high"
      ? "High load today"
      : profile.currentLoad === "low"
        ? "Low load today"
        : "Medium load today";
  return [threads, form, load];
}
