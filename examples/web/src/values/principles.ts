/** User-written values / principles (local only). */

export type PrinciplesDoc = {
  title: string;
  body: string;
  updatedAt: string;
  userEdited: boolean;
};

const KEY = "sc.values.principles";

export function defaultPrinciples(): PrinciplesDoc {
  return {
    title: "Principles",
    body: "",
    updatedAt: new Date(0).toISOString(),
    userEdited: false,
  };
}

export function loadPrinciples(): PrinciplesDoc {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultPrinciples();
    const parsed = JSON.parse(raw) as Partial<PrinciplesDoc>;
    return {
      ...defaultPrinciples(),
      ...parsed,
      title: String(parsed.title ?? "Principles"),
      body: String(parsed.body ?? ""),
    };
  } catch {
    return defaultPrinciples();
  }
}

export function savePrinciples(doc: PrinciplesDoc): void {
  const next: PrinciplesDoc = {
    title: doc.title.trim() || "Principles",
    body: doc.body,
    updatedAt: new Date().toISOString(),
    userEdited: true,
  };
  localStorage.setItem(KEY, JSON.stringify(next));
}
