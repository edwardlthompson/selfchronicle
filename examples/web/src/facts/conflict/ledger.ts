/** Conflict / tradeoff facts subtype (descriptive, not scored). */

export type ConflictRecord = {
  id: string;
  title: string;
  sides: string[];
  choice: string;
  outcome: string;
  createdAt: string;
};

const KEY = "sc.facts.conflict";

function newId(): string {
  return `conflict_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadConflicts(): ConflictRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as ConflictRecord[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveConflicts(records: ConflictRecord[]): void {
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function appendConflict(input: {
  title: string;
  sides: string[];
  choice: string;
  outcome?: string;
}): ConflictRecord {
  const rec: ConflictRecord = {
    id: newId(),
    title: input.title.trim(),
    sides: input.sides.map((s) => s.trim()).filter(Boolean),
    choice: input.choice.trim(),
    outcome: (input.outcome ?? "").trim(),
    createdAt: new Date().toISOString(),
  };
  if (!rec.title || rec.sides.length < 2 || !rec.choice) {
    throw new Error("title, ≥2 sides, and choice required");
  }
  saveConflicts([...loadConflicts(), rec]);
  return rec;
}
