/** Morality / values matrix — provisional priorities, never a single score. */

export type AxisId =
  | "care"
  | "fairness"
  | "loyalty"
  | "authority"
  | "liberty"
  | "honesty"
  | "long_termism";

export type AxisPlacement = {
  id: AxisId;
  label: string;
  /** Self-placement 0–100; descriptive priority, not a moral grade. */
  placement: number;
  why: string;
  confidence: number;
  user_edited: boolean;
  status: "provisional";
};

export type MoralityMatrix = {
  provisional: boolean;
  enabled: boolean;
  axes: AxisPlacement[];
  disclaimer: string;
};

export const MORALITY_DISCLAIMER =
  "How you describe what matters to you — provisional priorities you can edit. Not a morality score or judgment.";

const DEFAULT_AXES: { id: AxisId; label: string }[] = [
  { id: "care", label: "Care" },
  { id: "fairness", label: "Fairness" },
  { id: "loyalty", label: "Loyalty" },
  { id: "authority", label: "Authority" },
  { id: "liberty", label: "Liberty" },
  { id: "honesty", label: "Honesty" },
  { id: "long_termism", label: "Long-termism" },
];

const KEY = "sc.morality.matrix";

export function defaultMatrix(): MoralityMatrix {
  return {
    provisional: true,
    enabled: true,
    disclaimer: MORALITY_DISCLAIMER,
    axes: DEFAULT_AXES.map((a) => ({
      id: a.id,
      label: a.label,
      placement: 50,
      why: "",
      confidence: 0.4,
      user_edited: false,
      status: "provisional",
    })),
  };
}

export function getMatrix(): MoralityMatrix {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultMatrix();
    const parsed = JSON.parse(raw) as MoralityMatrix;
    return {
      ...defaultMatrix(),
      ...parsed,
      provisional: true,
      disclaimer: MORALITY_DISCLAIMER,
      axes: (parsed.axes ?? defaultMatrix().axes).map((ax) => ({
        ...ax,
        status: "provisional" as const,
      })),
    };
  } catch {
    return defaultMatrix();
  }
}

export function updateAxis(
  matrix: MoralityMatrix,
  id: AxisId,
  patch: Partial<Pick<AxisPlacement, "placement" | "why" | "confidence">>,
): MoralityMatrix {
  return {
    ...matrix,
    provisional: true,
    axes: matrix.axes.map((ax) =>
      ax.id === id
        ? { ...ax, ...patch, user_edited: true, status: "provisional" }
        : ax,
    ),
  };
}

export function saveMatrix(matrix: MoralityMatrix): void {
  localStorage.setItem(
    KEY,
    JSON.stringify({ ...matrix, provisional: true, disclaimer: MORALITY_DISCLAIMER }),
  );
}

/** Intentionally no aggregate score — axes stay independent. */
export function hasSingleScore(_matrix: MoralityMatrix): false {
  return false;
}
