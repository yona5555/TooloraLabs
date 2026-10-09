import { parseLocalizedNumber } from "@tooloralabs/core";
import type { BatchInvoice } from "@tooloralabs/tools";

/** One line item as typed: numbers stay strings so "12." or "٣" can be edited without being reformatted. */
export type DraftItem = { id: string; name: string; quantity: string; unitPrice: string };

export type DraftInvoice = { id: string; number: string; date: string; client: string; taxPercent: string; items: DraftItem[] };

export type StoredBatch = { invoices: DraftInvoice[]; currency: string };

export const STORAGE_KEY = "toolora:batch-invoices:v2";
/** v1 kept numbers and a "vendor" field; it is migrated once, then left untouched. */
export const LEGACY_STORAGE_KEY = "toolora:batch-invoices";

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const num = (raw: string) => {
  const v = parseLocalizedNumber(raw);
  return Number.isFinite(v) ? v : 0;
};

export const toBatch = (drafts: DraftInvoice[]): BatchInvoice[] =>
  drafts.map((d) => ({
    id: d.id,
    number: d.number,
    date: d.date,
    client: d.client,
    taxPercent: num(d.taxPercent),
    items: d.items.map((i) => ({ name: i.name, quantity: num(i.quantity), unitPrice: num(i.unitPrice) })),
  }));

/**
 * Currencies a batch can be written in: every ECB reference currency, plus the Gulf currencies whose
 * central banks peg them to the US dollar (units per 1 USD, fixed by law, so they convert exactly).
 */
export const USD_PEGS: Record<string, number> = { SAR: 3.75, AED: 3.6725, QAR: 3.64, BHD: 0.376, OMR: 0.3845 };

/** Sample batch: three invoices to three clients on three dates; names come from the locale's messages. */
export const SAMPLE_SHAPE = [
  { key: "inv1", number: "INV-1001", date: "2026-09-08", taxPercent: "8.5", items: [["redesign", "1", "2400"], ["copy", "12", "85"], ["photos", "6", "29"]] },
  { key: "inv2", number: "INV-1002", date: "2026-09-19", taxPercent: "8.5", items: [["logo", "1", "950"], ["menus", "200", "1.60"], ["social", "1", "450"]] },
  { key: "inv3", number: "INV-1003", date: "2026-10-02", taxPercent: "7.25", items: [["hosting", "3", "39"], ["seo", "1", "780"], ["support", "10", "65"]] },
] as const;

export type VatRow = {
  country: string;
  /** Region tag shown on the row. */
  region: "gulf" | "mena" | "europe" | "asia" | "americas" | "oceania" | "africa";
  kind: "vat" | "gst" | "sales" | "none";
  /** Standard rate in percent; null when no such tax is in force. */
  rate: number | null;
  since: string;
  source: string;
  url: string;
};

/** Standard rates checked against each tax authority (or the EU Commission's table) on VAT_CHECKED. */
export const VAT_CHECKED = "2026-10-10";
export const VAT_TABLE: VatRow[] = [
  { country: "SA", region: "gulf", kind: "vat", rate: 15, since: "2020-07-01", source: "ZATCA", url: "https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/default.aspx" },
  { country: "AE", region: "gulf", kind: "vat", rate: 5, since: "2018-01-01", source: "UAE Federal Tax Authority", url: "https://tax.gov.ae/en/taxes/vat.aspx" },
  { country: "BH", region: "gulf", kind: "vat", rate: 10, since: "2022-01-01", source: "Bahrain National Bureau for Revenue", url: "https://www.nbr.gov.bh/vat" },
  { country: "OM", region: "gulf", kind: "vat", rate: 5, since: "2021-04-16", source: "Oman Tax Authority", url: "https://tms.taxoman.gov.om/" },
  { country: "QA", region: "gulf", kind: "none", rate: null, since: "—", source: "Qatar General Tax Authority", url: "https://gta.gov.qa/en" },
  { country: "KW", region: "gulf", kind: "none", rate: null, since: "—", source: "Kuwait Ministry of Finance", url: "https://www.mof.gov.kw/" },
  { country: "EG", region: "mena", kind: "vat", rate: 14, since: "2017-07-01", source: "Egyptian Tax Authority", url: "https://www.eta.gov.eg/" },
  { country: "GB", region: "europe", kind: "vat", rate: 20, since: "2011-01-04", source: "HMRC", url: "https://www.gov.uk/guidance/rates-of-vat-on-different-goods-and-services" },
  { country: "DE", region: "europe", kind: "vat", rate: 19, since: "2007-01-01", source: "European Commission", url: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/vat-rates_en" },
  { country: "FR", region: "europe", kind: "vat", rate: 20, since: "2014-01-01", source: "European Commission", url: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/vat-rates_en" },
  { country: "ES", region: "europe", kind: "vat", rate: 21, since: "2012-09-01", source: "European Commission", url: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/vat-rates_en" },
  { country: "IT", region: "europe", kind: "vat", rate: 22, since: "2013-10-01", source: "European Commission", url: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/vat-rates_en" },
  { country: "FI", region: "europe", kind: "vat", rate: 25.5, since: "2024-09-01", source: "Finnish Tax Administration (Vero)", url: "https://www.vero.fi/en/businesses-and-corporations/taxes-and-charges/vat/rates-of-vat/" },
  { country: "CH", region: "europe", kind: "vat", rate: 8.1, since: "2024-01-01", source: "Swiss Federal Tax Administration", url: "https://www.estv.admin.ch/estv/en/home/value-added-tax/vat-rates-switzerland.html" },
  { country: "TR", region: "europe", kind: "vat", rate: 20, since: "2023-07-10", source: "Turkish Revenue Administration", url: "https://www.gib.gov.tr/" },
  { country: "IN", region: "asia", kind: "gst", rate: 18, since: "2025-09-22", source: "CBIC", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html" },
  { country: "JP", region: "asia", kind: "vat", rate: 10, since: "2019-10-01", source: "National Tax Agency Japan", url: "https://www.nta.go.jp/english/taxes/consumption_tax/01.htm" },
  { country: "CN", region: "asia", kind: "vat", rate: 13, since: "2019-04-01", source: "State Taxation Administration", url: "https://www.chinatax.gov.cn/eng/" },
  { country: "CA", region: "americas", kind: "gst", rate: 5, since: "2008-01-01", source: "Canada Revenue Agency", url: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-which-rate.html" },
  { country: "MX", region: "americas", kind: "vat", rate: 16, since: "2010-01-01", source: "SAT", url: "https://www.sat.gob.mx/" },
  { country: "US", region: "americas", kind: "sales", rate: null, since: "—", source: "Federation of Tax Administrators", url: "https://taxadmin.org/" },
  { country: "AU", region: "oceania", kind: "gst", rate: 10, since: "2000-07-01", source: "Australian Taxation Office", url: "https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst" },
  { country: "ZA", region: "africa", kind: "vat", rate: 15, since: "2018-04-01", source: "SARS", url: "https://www.sars.gov.za/types-of-tax/value-added-tax/" },
];
