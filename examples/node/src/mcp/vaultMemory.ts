export type VaultNote = {
  id: string;
  path: string;
  type: string;
  title: string;
  body: string;
  created_at: string;
};

export type MemoryVault = {
  list: (layer?: string) => VaultNote[];
  read: (id: string) => VaultNote | null;
  search: (q: string) => VaultNote[];
  summary: () => { facts: number; evidence: number; biography: number };
  onThisDay: (isoDate: string) => VaultNote[];
  appendEvidence: (title: string, body: string) => VaultNote;
};

export function createMemoryVault(seed: VaultNote[] = []): MemoryVault {
  const notes = [...seed];
  return {
    list(layer) {
      if (!layer) return [...notes];
      return notes.filter((n) => n.type === layer || n.path.startsWith(`${layer}/`));
    },
    read(id) {
      return notes.find((n) => n.id === id) ?? null;
    },
    search(q) {
      const needle = q.trim().toLowerCase();
      if (!needle) return [];
      return notes.filter(
        (n) =>
          n.title.toLowerCase().includes(needle) || n.body.toLowerCase().includes(needle),
      );
    },
    summary() {
      return {
        facts: notes.filter((n) => n.type === "fact").length,
        evidence: notes.filter((n) => n.type === "evidence").length,
        biography: notes.filter((n) => n.type === "biography").length,
      };
    },
    onThisDay(isoDate) {
      const md = isoDate.slice(5, 10); // MM-DD
      return notes.filter((n) => n.created_at.slice(5, 10) === md);
    },
    appendEvidence(title, body) {
      const created_at = new Date().toISOString();
      const id = `ev_${Math.random().toString(36).slice(2, 10)}`;
      const note: VaultNote = {
        id,
        path: `evidence/${created_at.slice(0, 10)}/${id}.md`,
        type: "evidence",
        title,
        body,
        created_at,
      };
      notes.push(note);
      return note;
    },
  };
}
