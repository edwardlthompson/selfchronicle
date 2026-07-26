/** Standout Profile Summary — user edits / pins win on rebuild. */

export type StandoutCard = {
  id: string;
  label: string;
  insight: string;
  layerSource: string;
  evidenceIds: string[];
  factIds: string[];
  pinned: boolean;
  provisional: boolean;
  user_edited: boolean;
};

export type ProfileSummary = {
  standouts: StandoutCard[];
  maxCards: number;
  rebuiltAt: string | null;
};

const KEY = "sc.profile.summary";
const DEFAULT_MAX = 12;

export function emptySummary(maxCards = DEFAULT_MAX): ProfileSummary {
  return { standouts: [], maxCards, rebuiltAt: null };
}

export function getSummary(): ProfileSummary {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySummary();
    const parsed = JSON.parse(raw) as ProfileSummary;
    return {
      standouts: parsed.standouts ?? [],
      maxCards: parsed.maxCards ?? DEFAULT_MAX,
      rebuiltAt: parsed.rebuiltAt ?? null,
    };
  } catch {
    return emptySummary();
  }
}

export function saveSummary(summary: ProfileSummary): void {
  localStorage.setItem(KEY, JSON.stringify(summary));
}

export function pinStandout(summary: ProfileSummary, id: string): ProfileSummary {
  return {
    ...summary,
    standouts: summary.standouts.map((s) =>
      s.id === id ? { ...s, pinned: true, user_edited: true } : s,
    ),
  };
}

export function editStandout(
  summary: ProfileSummary,
  id: string,
  patch: Partial<Pick<StandoutCard, "label" | "insight">>,
): ProfileSummary {
  return {
    ...summary,
    standouts: summary.standouts.map((s) =>
      s.id === id ? { ...s, ...patch, user_edited: true, provisional: true } : s,
    ),
  };
}

/**
 * Rebuild from candidates. User-edited and pinned cards win;
 * forgotten/tombstoned ids are excluded.
 */
export function rebuildSummary(
  existing: ProfileSummary,
  candidates: StandoutCard[],
  forgottenIds: ReadonlySet<string> = new Set(),
): ProfileSummary {
  const preserved = new Map(
    existing.standouts
      .filter((s) => (s.pinned || s.user_edited) && !forgottenIds.has(s.id))
      .map((s) => [s.id, s]),
  );

  const merged: StandoutCard[] = [];
  for (const c of candidates) {
    if (forgottenIds.has(c.id)) continue;
    const keep = preserved.get(c.id);
    if (keep) {
      merged.push(keep);
      preserved.delete(c.id);
    } else {
      merged.push({ ...c, provisional: true });
    }
  }
  for (const left of preserved.values()) {
    merged.push(left);
  }

  return {
    ...existing,
    standouts: merged.slice(0, existing.maxCards),
    rebuiltAt: new Date().toISOString(),
  };
}
