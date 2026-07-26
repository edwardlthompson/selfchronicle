/** Synthetic demo vault items — no real PII. */

export type DemoItem = {
  id: string;
  type: "evidence" | "fact" | "biography_chapter";
  title: string;
  body: string;
  createdAt: string;
};

export function seedDemoVault(): DemoItem[] {
  return [
    {
      id: "demo_ev_001",
      type: "evidence",
      title: "Demo: first journal stub",
      body: "A fictional morning note used only for guest demos.",
      createdAt: "2025-01-10T09:00:00Z",
    },
    {
      id: "demo_fact_001",
      type: "fact",
      title: "Demo: prefers offline-first tools",
      body: "Synthetic preference for illustrating Facts layer.",
      createdAt: "2025-02-01T12:00:00Z",
    },
    {
      id: "demo_bio_001",
      type: "biography_chapter",
      title: "Demo chapter: beginnings",
      body: "Placeholder biography chapter with invented details.",
      createdAt: "2025-03-15T18:00:00Z",
    },
  ];
}

export function isSyntheticId(id: string): boolean {
  return id.startsWith("demo_");
}
