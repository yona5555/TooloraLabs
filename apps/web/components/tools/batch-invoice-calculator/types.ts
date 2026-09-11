export type { BatchInvoiceCalculatorOutput } from "@tooloralabs/tools";

export type DraftLineItem = {
  itemName: string;
  quantity: string;
  unitPrice: string;
};

export type SavedInvoiceLineItem = {
  itemName: string;
  quantity: number;
  unitPrice: number;
};

export type SavedInvoice = {
  id: string;
  invoiceNumber: string;
  date: string;
  vendor: string;
  lineItems: SavedInvoiceLineItem[];
  taxPercent: number;
};

export const STORAGE_KEY = "toolora:batch-invoices";

export const SAMPLE_INVOICE: { invoiceNumber: string; vendor: string; lineItems: DraftLineItem[]; taxPercent: string } = {
  invoiceNumber: "INV-1001",
  vendor: "Acme Supplies",
  lineItems: [
    { itemName: "Consulting Hours", quantity: "12", unitPrice: "85" },
    { itemName: "Office Supplies", quantity: "3", unitPrice: "24.50" },
  ],
  taxPercent: "8.5",
};
