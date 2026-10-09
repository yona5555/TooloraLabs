import JSZip from "jszip";
import { batchOverview, lineTotal, toCsv, type BatchInvoice } from "@tooloralabs/tools";

export type ExportLabels = {
  invoice: string;
  date: string;
  client: string;
  item: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
  taxRate: string;
  net: string;
  tax: string;
  total: string;
  currency: string;
  grandTotal: string;
  itemsSheet: string;
  summarySheet: string;
};

type Cell = string | number;
const r2 = (v: number) => Math.round(v * 100) / 100;

/** Two tables: every line item, and one row per invoice ending in the batch totals. */
export function exportTables(invoices: BatchInvoice[], currency: string, l: ExportLabels): { items: Cell[][]; summary: Cell[][] } {
  const items: Cell[][] = [[l.invoice, l.date, l.client, l.item, l.quantity, l.unitPrice, l.lineTotal, l.taxRate, l.currency]];
  for (const inv of invoices) {
    for (const it of inv.items) items.push([inv.number, inv.date, inv.client, it.name, it.quantity, it.unitPrice, r2(lineTotal(it)), inv.taxPercent, currency]);
  }
  const o = batchOverview(invoices);
  const summary: Cell[][] = [[l.invoice, l.date, l.client, l.taxRate, l.net, l.tax, l.total, l.currency]];
  for (const row of o.perInvoice) summary.push([row.number, row.date, row.client, row.taxPercent, r2(row.subtotal), r2(row.tax), r2(row.total), currency]);
  summary.push([l.grandTotal, "", "", r2(o.effectiveTaxRate), r2(o.net), r2(o.tax), r2(o.grand), currency]);
  return { items, summary };
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCsv(invoices: BatchInvoice[], currency: string, l: ExportLabels) {
  const { items, summary } = exportTables(invoices, currency, l);
  // BOM so Excel opens UTF-8 (Arabic, Hindi) correctly; a blank row separates the two tables.
  const csv = `﻿${toCsv(items)}\r\n\r\n${toCsv(summary)}`;
  save(new Blob([csv], { type: "text/csv;charset=utf-8" }), "batch-invoices.csv");
}

const xml = (s: string) => s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
const col = (i: number) => {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};

function sheetXml(rows: Cell[][]): string {
  const body = rows
    .map((row, r) => {
      const cells = row
        .map((v, c) => {
          const ref = `${col(c)}${r + 1}`;
          const style = r === 0 ? ' s="1"' : "";
          return typeof v === "number" && Number.isFinite(v)
            ? `<c r="${ref}"${style}><v>${v}</v></c>`
            : `<c r="${ref}" t="inlineStr"${style}><is><t xml:space="preserve">${xml(String(v))}</t></is></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
}

/** A real .xlsx (Office Open XML) with an items sheet and a summary sheet; numbers stay numeric. */
export async function downloadXlsx(invoices: BatchInvoice[], currency: string, l: ExportLabels) {
  const { items, summary } = exportTables(invoices, currency, l);
  const sheetName = (s: string) => xml(s.replace(/[\\/?*[\]:]/g, " ").slice(0, 31));
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
  );
  zip.file(
    "xl/workbook.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${sheetName(l.itemsSheet)}" sheetId="1" r:id="rId1"/><sheet name="${sheetName(l.summarySheet)}" sheetId="2" r:id="rId2"/></sheets></workbook>`
  );
  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
  );
  zip.file(
    "xl/styles.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>`
  );
  zip.file("xl/worksheets/sheet1.xml", sheetXml(items));
  zip.file("xl/worksheets/sheet2.xml", sheetXml(summary));
  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  save(blob, "batch-invoices.xlsx");
}
