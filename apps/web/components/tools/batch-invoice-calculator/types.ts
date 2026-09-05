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
