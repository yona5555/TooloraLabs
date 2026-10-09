import { LEGACY_STORAGE_KEY, STORAGE_KEY, newId, type DraftInvoice, type StoredBatch } from "./types";

const isString = (v: unknown): v is string => typeof v === "string";

function isDraftInvoice(value: unknown): value is DraftInvoice {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    [v.id, v.number, v.date, v.client, v.taxPercent].every(isString) &&
    Array.isArray(v.items) &&
    v.items.every((i) => i && typeof i === "object" && [i.id, i.name, i.quantity, i.unitPrice].every(isString))
  );
}

type LegacyInvoice = { id: string; invoiceNumber: string; date: string; vendor: string; taxPercent: number; lineItems: { itemName: string; quantity: number; unitPrice: number }[] };

function fromLegacy(raw: string): DraftInvoice[] | null {
  try {
    const parsed = JSON.parse(raw) as LegacyInvoice[];
    if (!Array.isArray(parsed)) return null;
    return parsed
      .filter((p) => p && typeof p.id === "string" && Array.isArray(p.lineItems))
      .map((p) => ({
        id: p.id,
        number: String(p.invoiceNumber ?? ""),
        date: String(p.date ?? ""),
        client: String(p.vendor ?? ""),
        taxPercent: String(p.taxPercent ?? 0),
        items: p.lineItems.map((i) => ({ id: newId(), name: String(i.itemName ?? ""), quantity: String(i.quantity ?? ""), unitPrice: String(i.unitPrice ?? "") })),
      }));
  } catch {
    return null;
  }
}

/**
 * The visitor's saved batch, or null when nothing was ever saved (the page then keeps its sample).
 * An emptied batch is saved as an empty list, so "Clear All" survives a reload.
 */
export function readBatch(): StoredBatch | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredBatch>;
      if (Array.isArray(parsed.invoices) && isString(parsed.currency)) {
        return { invoices: parsed.invoices.filter(isDraftInvoice), currency: parsed.currency };
      }
    }
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    const migrated = legacy ? fromLegacy(legacy) : null;
    return migrated && migrated.length ? { invoices: migrated, currency: "USD" } : null;
  } catch {
    return null;
  }
}

export function writeBatch(batch: StoredBatch): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(batch));
  } catch {
    /* storage blocked or full: the batch lasts for this visit only */
  }
}
