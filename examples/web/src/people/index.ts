/**
 * Curated people index — user-entered only.
 * Never scrape device address books or OS contact pickers.
 */

export type PersonEntry = {
  id: string;
  displayName: string;
  notes: string;
  tags: string[];
};

const KEY = "sc.people.index";

function newId(): string {
  return `person_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadPeople(): PersonEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as PersonEntry[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function savePeople(people: PersonEntry[]): void {
  localStorage.setItem(KEY, JSON.stringify(people));
}

export function addPerson(
  displayName: string,
  notes = "",
  tags: string[] = [],
): PersonEntry {
  const entry: PersonEntry = {
    id: newId(),
    displayName: displayName.trim(),
    notes,
    tags: [...tags],
  };
  if (!entry.displayName) throw new Error("displayName required");
  const next = [...loadPeople(), entry];
  savePeople(next);
  return entry;
}

/** Explicit guard: this module must never touch device contact pickers. */
export function assertNoDeviceContacts(): void {
  // Intentionally no device contact API access.
}
