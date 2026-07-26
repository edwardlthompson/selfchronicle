/** Trust ledger — forget / tombstone respect. */

export type LedgerEntry = {
  id: string;
  kind: "memory" | "callback" | "standout";
  body: string;
  forgotten: boolean;
  tombstonedAt: string | null;
};

export type TrustLedger = {
  entries: LedgerEntry[];
};

const KEY = "sc.companion.trust_ledger";

export function emptyLedger(): TrustLedger {
  return { entries: [] };
}

export function loadLedger(): TrustLedger {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyLedger();
    const parsed = JSON.parse(raw) as TrustLedger;
    return { entries: parsed.entries ?? [] };
  } catch {
    return emptyLedger();
  }
}

export function saveLedger(ledger: TrustLedger): void {
  localStorage.setItem(KEY, JSON.stringify(ledger));
}

export function remember(
  ledger: TrustLedger,
  entry: Omit<LedgerEntry, "forgotten" | "tombstonedAt">,
): TrustLedger {
  if (ledger.entries.some((e) => e.id === entry.id && e.forgotten)) {
    return ledger;
  }
  const rest = ledger.entries.filter((e) => e.id !== entry.id);
  return {
    entries: [
      ...rest,
      { ...entry, forgotten: false, tombstonedAt: null },
    ],
  };
}

export function forget(ledger: TrustLedger, id: string): TrustLedger {
  return {
    entries: ledger.entries.map((e) =>
      e.id === id
        ? { ...e, forgotten: true, tombstonedAt: new Date().toISOString(), body: "" }
        : e,
    ),
  };
}

export function visibleEntries(ledger: TrustLedger): LedgerEntry[] {
  return ledger.entries.filter((e) => !e.forgotten);
}

export function isForgotten(ledger: TrustLedger, id: string): boolean {
  return ledger.entries.some((e) => e.id === id && e.forgotten);
}

/** Forgotten ids must not reappear via remember(). */
export function respectTombstone(ledger: TrustLedger, id: string): boolean {
  return isForgotten(ledger, id);
}
