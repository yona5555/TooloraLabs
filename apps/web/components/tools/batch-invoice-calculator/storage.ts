import { STORAGE_KEY, type SavedInvoice } from "./types";

let cachedRaw: string | null = null;
let cachedInvoices: SavedInvoice[] = [];

function isValidInvoice(value: unknown): value is SavedInvoice {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.invoiceNumber === "string" &&
    typeof v.date === "string" &&
    typeof v.vendor === "string" &&
    Array.isArray(v.lineItems) &&
    typeof v.taxPercent === "number"
  );
}

export function readStoredInvoices(): SavedInvoice[] {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return cachedInvoices;
  }
  if (raw === cachedRaw) return cachedInvoices;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedInvoices = Array.isArray(parsed) ? parsed.filter(isValidInvoice) : [];
  } catch {
    cachedInvoices = [];
  }
  return cachedInvoices;
}

export function writeStoredInvoices(invoices: SavedInvoice[]): void {
  try {
    const raw = JSON.stringify(invoices);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedInvoices = invoices;
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded, etc.) — fail silently.
  }
}

export function subscribeToInvoiceStorage(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function getServerInvoices(): SavedInvoice[] {
  return [];
}
