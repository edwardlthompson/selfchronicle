/** Soft-layer handoff inclusion — morality & cognition default OFF. */

export type SoftHandoffLayer = "wellbeing" | "morality" | "cognition";

export type LayerOptIn = {
  wellbeing: boolean;
  morality: boolean;
  cognition: boolean;
};

export const DEFAULT_LAYER_OPT_IN: LayerOptIn = {
  wellbeing: false,
  morality: false,
  cognition: false,
};

const KEY = "sc.handoff.layer_opt_in";

export function defaultOptIn(): LayerOptIn {
  return { ...DEFAULT_LAYER_OPT_IN };
}

export function loadOptIn(): LayerOptIn {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultOptIn();
    const parsed = JSON.parse(raw) as Partial<LayerOptIn>;
    return {
      wellbeing: parsed.wellbeing === true,
      morality: parsed.morality === true,
      cognition: parsed.cognition === true,
    };
  } catch {
    return defaultOptIn();
  }
}

export function saveOptIn(opt: LayerOptIn): void {
  localStorage.setItem(KEY, JSON.stringify(opt));
}

export function setLayerOptIn(
  opt: LayerOptIn,
  layer: SoftHandoffLayer,
  include: boolean,
): LayerOptIn {
  return { ...opt, [layer]: include };
}

export function includedLayers(opt: LayerOptIn): SoftHandoffLayer[] {
  return (["wellbeing", "morality", "cognition"] as const).filter((l) => opt[l]);
}

export function isExcludedByDefault(layer: SoftHandoffLayer): boolean {
  return DEFAULT_LAYER_OPT_IN[layer] === false;
}
