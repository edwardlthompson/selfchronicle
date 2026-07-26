export type RedactionPreset = "coding" | "personal" | "redacted";

export type RedactionPolicy = {
  preset: RedactionPreset;
  includeWellbeing: boolean;
  includeMorality: boolean;
  includeCognition: boolean;
  stripThirdPartyNames: boolean;
};

export function policyFor(preset: RedactionPreset): RedactionPolicy {
  if (preset === "coding") {
    return {
      preset,
      includeWellbeing: false,
      includeMorality: false,
      includeCognition: false,
      stripThirdPartyNames: true,
    };
  }
  if (preset === "personal") {
    return {
      preset,
      includeWellbeing: false,
      includeMorality: false,
      includeCognition: false,
      stripThirdPartyNames: false,
    };
  }
  return {
    preset: "redacted",
    includeWellbeing: false,
    includeMorality: false,
    includeCognition: false,
    stripThirdPartyNames: true,
  };
}
