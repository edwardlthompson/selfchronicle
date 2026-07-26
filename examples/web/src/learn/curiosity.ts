export type CuriosityStatus = "open" | "asked" | "answered" | "snoozed";

export type CuriosityItem = {
  id: string;
  question: string;
  tags: string[];
  priority: number;
  status: CuriosityStatus;
};

const KEY = "sc.curiosity.queue";

export function loadCuriosity(): CuriosityItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedCuriosity();
    return JSON.parse(raw) as CuriosityItem[];
  } catch {
    return seedCuriosity();
  }
}

export function saveCuriosity(items: CuriosityItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function seedCuriosity(): CuriosityItem[] {
  const items: CuriosityItem[] = [
    {
      id: "cu_1",
      question: "What are you learning about yourself this season?",
      tags: ["deep", "evening"],
      priority: 1,
      status: "open",
    },
    {
      id: "cu_2",
      question: "Which value showed up in your choices this week?",
      tags: ["morality", "deep"],
      priority: 2,
      status: "open",
    },
  ];
  saveCuriosity(items);
  return items;
}

export function nextOpen(items: CuriosityItem[]): CuriosityItem | null {
  return (
    [...items]
      .filter((i) => i.status === "open")
      .sort((a, b) => a.priority - b.priority)[0] ?? null
  );
}
