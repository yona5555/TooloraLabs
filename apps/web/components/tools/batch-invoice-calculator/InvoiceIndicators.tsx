"use client";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  concentrationZone,
  convertViaUsd,
  herfindahl,
  invoicesByDate,
  rankLineItems,
  revenueByClient,
  taxRateSensitivity,
  type BatchInvoice,
  type BatchOverview,
} from "@tooloralabs/tools";
import IndicatorCard from "@/components/tools/markets/IndicatorCard";
import SemiGauge from "@/components/tools/markets/SemiGauge";
import SensitivityBars from "@/components/tools/markets/SensitivityBars";
import { shortDate, type InvoiceFormatters } from "./format";
import { VAT_CHECKED, VAT_TABLE } from "./types";

export type IndicatorProps = { invoices: BatchInvoice[]; overview: BatchOverview; f: InvoiceFormatters };

/** One colour per invoice, reused by every indicator so an invoice reads the same everywhere. */
export const INVOICE_COLORS = ["#2563eb", "#8b5cf6", "#0d9488", "#db2777", "#ea580c", "#65a30d", "#0891b2", "#9333ea"];
const NET = "#0ea5e9";
const TAX = "#f59e0b";

function useInd() {
  return useTranslations("tools.batch-invoice-calculator.ind");
}

/** The fallback every indicator shows while the batch is empty. */
function Empty() {
  const t = useInd();
  return <p className="mt-4 rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">{t("empty")}</p>;
}

const empty = (o: BatchOverview) => (o.invoiceCount === 0 || o.grand <= 0 ? <Empty /> : undefined);
const label = (inv: { number: string }, i: number) => inv.number || `#${i + 1}`;

/* 1 — §31 type 5: every line item in the batch, largest first. */
export function LineItemsRanked({ invoices, overview, f }: IndicatorProps) {
  const t = useInd();
  const rows = useMemo(() => rankLineItems(invoices), [invoices]);
  const top = rows[0];
  const shown = rows.slice(0, 10);
  const max = top?.total || 1;
  const colorOf = (id: string) => INVOICE_COLORS[invoices.findIndex((i) => i.id === id) % INVOICE_COLORS.length];
  return (
    <IndicatorCard
      id="line-items"
      title={t("items.title")}
      heading={t("items.heading", { count: rows.length })}
      intro={t("items.intro")}
      fallback={empty(overview)}
      worked={
        top
          ? {
              title: t("worked"),
              rows: [
                { label: t("items.rowTop"), value: top.name || "—" },
                { label: t("items.rowLine"), value: `${f.num(top.quantity)} × ${f.money(top.unitPrice)} = ${f.money(top.total)}` },
                { label: t("items.rowNet"), value: f.money(overview.net) },
                { label: t("items.rowShare"), value: `${f.money(top.total)} ÷ ${f.money(overview.net)}` },
                { label: t("items.rowResult"), value: f.pct(top.share), emphasize: true, note: t("items.note", { count: rows.length }) },
              ],
            }
          : null
      }
    >
      <ol className="space-y-2" data-testid="ind-line-items">
        {shown.map((r, i) => (
          <li key={`${r.invoiceId}-${i}`} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-2">
            <span className="text-center font-mono text-xs font-bold text-zinc-400">{i + 1}</span>
            <span className="min-w-0">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{r.name || "—"}</span>
                <span className="shrink-0 text-[10px] text-zinc-400">{r.invoiceNumber}</span>
              </span>
              <span className="mt-1 block h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <span className="block h-full rounded-full transition-all duration-500" style={{ width: `${(r.total / max) * 100}%`, background: colorOf(r.invoiceId) }} />
              </span>
            </span>
            <span className="text-end">
              <span dir="ltr" className="block font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {f.money(r.total)}
              </span>
              <span dir="ltr" className="block font-mono text-[10px] text-zinc-500">
                {f.pct(r.share)}
              </span>
            </span>
          </li>
        ))}
      </ol>
      {rows.length > shown.length && <p className="mt-2 text-xs text-zinc-400">{t("items.more", { count: rows.length - shown.length })}</p>}
    </IndicatorCard>
  );
}

/* 2 — §31 type 6: invoices on the outer ring, net vs tax on the inner ring. */
export function CompositionDonut({ overview, f }: IndicatorProps) {
  const t = useInd();
  const S = 200;
  const c = S / 2;
  const ring = (values: number[], r: number, w: number, colors: string[]) => {
    const total = values.reduce((s, v) => s + v, 0) || 1;
    const circ = 2 * Math.PI * r;
    let acc = 0;
    return values.map((v, i) => {
      const len = (v / total) * circ;
      const el = <circle key={i} cx={c} cy={c} r={r} fill="none" stroke={colors[i % colors.length]} strokeWidth={w} strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-acc} transform={`rotate(-90 ${c} ${c})`} className="transition-all duration-500" />;
      acc += len;
      return el;
    });
  };
  const per = overview.perInvoice;
  const biggest = per.reduce((b, r) => (r.total > (b?.total ?? -1) ? r : b), per[0]);
  return (
    <IndicatorCard
      id="composition"
      title={t("donut.title")}
      heading={t("donut.heading", { count: overview.invoiceCount })}
      intro={t("donut.intro")}
      fallback={empty(overview)}
      worked={
        biggest
          ? {
              title: t("worked"),
              rows: [
                { label: t("donut.rowBiggest"), value: `${biggest.number} · ${f.money(biggest.total)}` },
                { label: t("donut.rowOuter"), value: `${f.money(biggest.total)} ÷ ${f.money(overview.grand)} = ${f.pct((biggest.total / overview.grand) * 100)}` },
                { label: t("donut.rowNet"), value: `${f.money(overview.net)} = ${f.pct((overview.net / overview.grand) * 100)}` },
                { label: t("donut.rowTax"), value: `${f.money(overview.tax)} = ${f.pct((overview.tax / overview.grand) * 100)}` },
                { label: t("donut.rowResult"), value: f.money(overview.grand), emphasize: true },
              ],
            }
          : null
      }
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center" data-testid="ind-donut">
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} role="img" aria-label={t("donut.title")} className="shrink-0">
          {ring(per.map((r) => r.total), 82, 22, INVOICE_COLORS)}
          {ring([overview.net, overview.tax], 56, 18, [NET, TAX])}
          <text x={c} y={c - 4} textAnchor="middle" className="fill-zinc-400 text-[10px]">
            {t("donut.center")}
          </text>
          <text x={c} y={c + 12} textAnchor="middle" direction="ltr" className="fill-zinc-900 font-mono text-[12px] font-bold dark:fill-zinc-100">
            {f.compact(overview.grand)}
          </text>
        </svg>
        <ul className="w-full max-w-xs space-y-1.5 text-sm">
          {per.map((r, i) => (
            <li key={r.id} className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: INVOICE_COLORS[i % INVOICE_COLORS.length] }} />
              <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-300">{label(r, i)}</span>
              <span dir="ltr" className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {f.pct((r.total / overview.grand) * 100)}
              </span>
            </li>
          ))}
          <li className="flex items-center gap-2 border-t border-zinc-200 pt-1.5 dark:border-zinc-700">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: NET }} />
            <span className="flex-1 text-zinc-700 dark:text-zinc-300">{t("net")}</span>
            <span dir="ltr" className="font-mono text-xs font-semibold">{f.pct((overview.net / overview.grand) * 100)}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: TAX }} />
            <span className="flex-1 text-zinc-700 dark:text-zinc-300">{t("tax")}</span>
            <span dir="ltr" className="font-mono text-xs font-semibold">{f.pct((overview.tax / overview.grand) * 100)}</span>
          </li>
        </ul>
      </div>
    </IndicatorCard>
  );
}

/* 3 — §31 type 15: each invoice's total split into net and tax. */
export function NetTaxStacked({ overview, f }: IndicatorProps) {
  const t = useInd();
  const per = overview.perInvoice;
  const max = Math.max(...per.map((r) => r.total), 1e-9);
  const top = per.reduce((b, r) => (r.tax > (b?.tax ?? -1) ? r : b), per[0]);
  return (
    <IndicatorCard
      id="net-tax"
      title={t("stacked.title")}
      heading={t("stacked.heading")}
      intro={t("stacked.intro")}
      fallback={empty(overview)}
      worked={
        top
          ? {
              title: t("worked"),
              rows: [
                { label: t("stacked.rowInvoice"), value: `${top.number || "—"} (${f.pct(top.taxPercent, 3)})` },
                { label: t("net"), value: f.money(top.subtotal) },
                { label: t("stacked.rowTax"), value: `${f.money(top.subtotal)} × ${f.pct(top.taxPercent, 3)} = ${f.money(top.tax)}` },
                { label: t("stacked.rowTotal"), value: `${f.money(top.subtotal)} + ${f.money(top.tax)}` },
                { label: t("stacked.rowResult"), value: f.money(top.total), emphasize: true, note: t("stacked.note") },
              ],
            }
          : null
      }
    >
      <ul className="space-y-3" data-testid="ind-stacked">
        {per.map((r, i) => (
          <li key={r.id}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">
                {label(r, i)} <span className="text-xs font-normal text-zinc-400">{r.client}</span>
              </span>
              <span dir="ltr" className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {f.money(r.total)}
              </span>
            </div>
            <div dir="ltr" className="mt-1 flex items-center gap-2">
            <div className="flex h-6 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800" style={{ width: `calc(${Math.max(8, (r.total / max) * 100)}% - 5rem)` }}>
              <div className="flex items-center justify-start overflow-hidden px-1.5 font-mono text-[10px] font-semibold text-white transition-all duration-500" style={{ width: `${r.total ? (r.subtotal / r.total) * 100 : 0}%`, background: NET }}>
                {f.compact(r.subtotal)}
              </div>
              <div className="transition-all duration-500" style={{ width: `${r.total ? (r.tax / r.total) * 100 : 0}%`, background: TAX }} />
            </div>
            <span className="shrink-0 font-mono text-[11px] font-semibold text-amber-600 dark:text-amber-400">+{f.compact(r.tax)}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: NET }} />{t("net")}</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: TAX }} />{t("tax")}</span>
      </div>
    </IndicatorCard>
  );
}

/* 4 — §31 type 7: totals by date against the batch average. */
export function TotalsTrend({ invoices, overview, f }: IndicatorProps) {
  const t = useInd();
  const locale = useLocale();
  const pts = useMemo(() => invoicesByDate(invoices), [invoices]);
  const W = 520;
  const H = 220;
  const pad = { l: 12, r: 12, t: 26, b: 34 };
  const max = Math.max(...pts.map((p) => p.total), overview.averageInvoice, 1e-9) * 1.1;
  const x = (i: number) => (pts.length <= 1 ? W / 2 : pad.l + 30 + (i * (W - pad.l - pad.r - 60)) / (pts.length - 1));
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const peak = pts.reduce((b, p, i) => (p.total > pts[b].total ? i : b), 0);
  const low = pts.reduce((b, p, i) => (p.total < pts[b].total ? i : b), 0);
  return (
    <IndicatorCard
      id="trend"
      title={t("trend.title")}
      heading={t("trend.heading")}
      intro={t("trend.intro")}
      fallback={empty(overview)}
      worked={
        pts.length
          ? {
              title: t("worked"),
              rows: [
                { label: t("trend.rowAverage"), value: `${f.money(overview.grand)} ÷ ${f.num(pts.length, 0)} = ${f.money(overview.averageInvoice)}` },
                { label: t("trend.rowPeak", { n: pts[peak].number || "—" }), value: f.money(pts[peak].total) },
                { label: t("trend.rowAbove"), value: f.signed(pts[peak].total - overview.averageInvoice) },
                { label: t("trend.rowLow", { n: pts[low].number || "—" }), value: f.money(pts[low].total) },
                { label: t("trend.rowResult"), value: f.pct(overview.averageInvoice ? ((pts[peak].total - overview.averageInvoice) / overview.averageInvoice) * 100 : 0), emphasize: true },
              ],
            }
          : null
      }
    >
      <div className="overflow-x-auto" dir="ltr" data-testid="ind-trend">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("trend.title")} className="mx-auto block">
          <line x1={pad.l} x2={W - pad.r} y1={y(overview.averageInvoice)} y2={y(overview.averageInvoice)} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 4" />
          <text x={W - pad.r} y={y(overview.averageInvoice) - 5} textAnchor="end" className="fill-amber-600 font-mono text-[10px] font-semibold dark:fill-amber-400">
            {t("trend.avg")} {f.money(overview.averageInvoice)}
          </text>
          {pts.length > 1 && (
            <>
              <path d={`M ${x(0)} ${H - pad.b} ${pts.map((p, i) => `L ${x(i)} ${y(p.total)}`).join(" ")} L ${x(pts.length - 1)} ${H - pad.b} Z`} fill="#2563eb" opacity={0.08} />
              <polyline points={pts.map((p, i) => `${x(i)},${y(p.total)}`).join(" ")} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinejoin="round" />
            </>
          )}
          {pts.map((p, i) => (
            <g key={p.id}>
              <circle cx={x(i)} cy={y(p.total)} r={i === peak ? 7 : 5} fill={i === peak ? "#2563eb" : "white"} stroke="#2563eb" strokeWidth={2.5} />
              <text x={x(i)} y={y(p.total) - 11} textAnchor="middle" className="fill-zinc-800 font-mono text-[10px] font-bold dark:fill-zinc-100">
                {f.compact(p.total)}
              </text>
              <text x={x(i)} y={H - pad.b + 15} textAnchor="middle" className="fill-zinc-500 text-[10px]">
                {shortDate(p.date, locale)}
              </text>
              <text x={x(i)} y={H - pad.b + 28} textAnchor="middle" className="fill-zinc-400 text-[9px]">
                {p.number}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </IndicatorCard>
  );
}

/* 5 — §31 type 9: invoices as stations along the calendar. */
export function InvoiceTimeline({ invoices, overview, f }: IndicatorProps) {
  const t = useInd();
  const locale = useLocale();
  const pts = useMemo(() => invoicesByDate(invoices), [invoices]);
  const span = pts.length ? pts[pts.length - 1].dayOffset : 0;
  const gap = pts.length > 1 ? span / (pts.length - 1) : 0;
  const pos = (d: number, i: number) => (span > 0 ? (d / span) * 100 : pts.length > 1 ? (i / (pts.length - 1)) * 100 : 50);
  return (
    <IndicatorCard
      id="timeline"
      title={t("timeline.title")}
      heading={t("timeline.heading", { days: span })}
      intro={t("timeline.intro")}
      fallback={empty(overview)}
      worked={
        pts.length
          ? {
              title: t("worked"),
              rows: [
                { label: t("timeline.rowFirst"), value: `${pts[0].date} · ${pts[0].number}` },
                { label: t("timeline.rowLast"), value: `${pts[pts.length - 1].date} · ${pts[pts.length - 1].number}` },
                { label: t("timeline.rowSpan"), value: t("timeline.days", { days: span }) },
                { label: t("timeline.rowGap"), value: `${f.num(span, 0)} ÷ ${f.num(Math.max(1, pts.length - 1), 0)} = ${t("timeline.days", { days: f.num(gap, 1) })}` },
                { label: t("timeline.rowResult"), value: f.money(span > 0 ? overview.grand / (span + 1) : overview.grand), emphasize: true, note: t("timeline.note") },
              ],
            }
          : null
      }
    >
      <div className="px-10 pb-2 pt-20" data-testid="ind-timeline">
        <div dir="ltr" className="relative h-1.5 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 dark:from-blue-900 dark:to-blue-500">
          {pts.map((p, i) => (
            <div key={p.id} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pos(p.dayOffset, i)}%` }}>
              <div className={`absolute bottom-4 left-1/2 w-24 -translate-x-1/2 text-center ${i % 2 ? "bottom-auto top-4" : ""}`}>
                <p className="truncate text-[11px] font-semibold text-zinc-800 dark:text-zinc-100">{p.number || "—"}</p>
                <p className="font-mono text-[11px] font-bold text-blue-700 dark:text-blue-300">{f.compact(p.total)}</p>
                <p className="text-[10px] text-zinc-400">{shortDate(p.date, locale)}</p>
              </div>
              <span className="block h-4 w-4 rounded-full border-[3px] border-white shadow dark:border-zinc-900" style={{ background: INVOICE_COLORS[invoices.findIndex((x) => x.id === p.id) % INVOICE_COLORS.length] }} />
            </div>
          ))}
        </div>
        <div className="h-14" />
      </div>
    </IndicatorCard>
  );
}

/* 6 — §31 type 5: revenue grouped by client. */
export function RevenueByClient({ invoices, overview, f }: IndicatorProps) {
  const t = useInd();
  const rows = useMemo(() => revenueByClient(invoices, t("noClient")), [invoices, t]);
  const top = rows[0];
  return (
    <IndicatorCard
      id="clients"
      title={t("clients.title")}
      heading={t("clients.heading", { count: rows.length })}
      intro={t("clients.intro")}
      fallback={empty(overview)}
      worked={
        top
          ? {
              title: t("worked"),
              rows: [
                { label: t("clients.rowTop"), value: top.client },
                { label: t("clients.rowInvoices"), value: f.num(top.invoiceCount, 0) },
                { label: t("clients.rowTotal"), value: `${f.money(top.net)} + ${f.money(top.tax)} = ${f.money(top.total)}` },
                { label: t("clients.rowShare"), value: `${f.money(top.total)} ÷ ${f.money(overview.grand)}` },
                { label: t("clients.rowResult"), value: f.pct(top.share), emphasize: true },
              ],
            }
          : null
      }
    >
      <ol className="space-y-2.5" data-testid="ind-clients">
        {rows.map((r, i) => (
          <li key={r.client} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3">
            <span className="min-w-0">
              <span className="flex items-baseline gap-2">
                <span className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{r.client}</span>
                <span className="shrink-0 text-[10px] text-zinc-400">{t("clients.invoices", { count: r.invoiceCount })}</span>
              </span>
              <span className="mt-1 block h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <span className={`block h-full rounded-full transition-all duration-500 ${i === 0 ? "bg-blue-600" : "bg-blue-400/70"}`} style={{ width: `${(r.total / (top?.total || 1)) * 100}%` }} />
              </span>
            </span>
            <span className="text-end">
              <span dir="ltr" className="block font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{f.money(r.total)}</span>
              <span dir="ltr" className="block font-mono text-[10px] text-zinc-500">{f.pct(r.share)}</span>
            </span>
          </li>
        ))}
      </ol>
    </IndicatorCard>
  );
}

/* 7 — §31 type 8: how much of the batch depends on the largest client. */
export function ClientConcentration({ invoices, overview, f }: IndicatorProps) {
  const t = useInd();
  const rows = useMemo(() => revenueByClient(invoices, t("noClient")), [invoices, t]);
  const top = rows[0];
  const share = top?.share ?? 0;
  const zone = concentrationZone(share);
  const zoneClass = { low: "text-emerald-600 dark:text-emerald-400", medium: "text-amber-600 dark:text-amber-400", high: "text-red-600 dark:text-red-400" }[zone];
  return (
    <IndicatorCard
      id="concentration"
      title={t("gauge.title")}
      heading={t("gauge.heading")}
      intro={t("gauge.intro")}
      fallback={empty(overview)}
      worked={
        top
          ? {
              title: t("worked"),
              rows: [
                { label: t("gauge.rowTop"), value: `${top.client} · ${f.money(top.total)}` },
                { label: t("gauge.rowShare"), value: `${f.money(top.total)} ÷ ${f.money(overview.grand)} = ${f.pct(share)}` },
                { label: t("gauge.rowClients"), value: f.num(rows.length, 0) },
                { label: t("gauge.rowHhi"), value: f.num(herfindahl(rows), 0) },
                { label: t("gauge.rowResult"), value: t(`gauge.zone.${zone}`), emphasize: true, note: t("gauge.note") },
              ],
            }
          : null
      }
    >
      <div className="flex flex-col items-center" data-testid="ind-gauge">
        <SemiGauge
          value={share}
          max={100}
          zones={[
            { to: 25, className: "stroke-emerald-500" },
            { to: 50, className: "stroke-amber-500" },
            { to: 100, className: "stroke-red-500" },
          ]}
          ticks={[25, 50, 75].map((v) => ({ value: v, label: `${v}%` }))}
          ariaLabel={t("gauge.title")}
        />
        <p dir="ltr" className="-mt-2 font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-100" data-value={f.pct(share)}>
          {f.pct(share)}
        </p>
        <p className={`text-sm font-semibold ${zoneClass}`}>{t(`gauge.zone.${zone}`)}</p>
        <div className="mt-3 grid w-full max-w-md grid-cols-3 gap-2 text-center text-[11px]">
          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{t("gauge.zone.low")} &lt; 25%</span>
          <span className="rounded-lg bg-amber-50 px-2 py-1 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">25–50%</span>
          <span className="rounded-lg bg-red-50 px-2 py-1 text-red-700 dark:bg-red-500/10 dark:text-red-300">{t("gauge.zone.high")} &gt; 50%</span>
        </div>
      </div>
    </IndicatorCard>
  );
}

/* 8 — §31 type 14: a beam weighing what you keep against what you collect for the tax authority. */
export function NetTaxBalance({ overview, f }: IndicatorProps) {
  const t = useInd();
  const { net, tax, grand } = overview;
  const tilt = grand > 0 ? ((net - tax) / grand) * 14 : 0;
  const per100 = net > 0 ? (tax / net) * 100 : 0;
  return (
    <IndicatorCard
      id="balance"
      title={t("balance.title")}
      heading={t("balance.heading")}
      intro={t("balance.intro")}
      fallback={empty(overview)}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("net"), value: f.money(net) },
          { label: t("tax"), value: f.money(tax) },
          { label: t("balance.rowRatio"), value: `${f.money(tax)} ÷ ${f.money(net)} = ${f.pct(per100, 2)}` },
          { label: t("balance.rowPer100"), value: f.money(per100) },
          { label: t("balance.rowResult"), value: `${f.pct(grand ? (net / grand) * 100 : 0)} : ${f.pct(grand ? (tax / grand) * 100 : 0)}`, emphasize: true },
        ],
      }}
    >
      <div dir="ltr" className="flex justify-center overflow-x-auto" data-testid="ind-balance">
        <svg width={420} height={250} viewBox="0 0 420 250" role="img" aria-label={t("balance.title")}>
          <polygon points="195,235 225,235 210,118" className="fill-zinc-300 dark:fill-zinc-600" />
          {(() => {
            const dy = Math.sin((tilt * Math.PI) / 180) * 160;
            const pan = (x: number, y: number, fill: string, text: string, k: string, v: string) => (
              <g className="transition-all duration-700">
                <line x1={x} y1={y} x2={x} y2={y + 26} className="stroke-zinc-400" />
                <rect x={x - 55} y={y + 26} width={110} height={44} rx={10} fill={fill} />
                <text x={x} y={y + 44} textAnchor="middle" className={`${text} text-[11px] font-semibold`}>{k}</text>
                <text x={x} y={y + 61} textAnchor="middle" className={`${text} font-mono text-[12px] font-bold`}>{v}</text>
              </g>
            );
            return (
              <>
                <line x1={50} y1={118 + dy} x2={370} y2={118 - dy} strokeWidth={8} strokeLinecap="round" className="stroke-zinc-700 transition-all duration-700 dark:stroke-zinc-300" />
                {pan(60, 118 + dy * (150 / 160), NET, "fill-white", t("net"), f.compact(net))}
                {pan(360, 118 - dy * (150 / 160), TAX, "fill-zinc-900", t("tax"), f.compact(tax))}
              </>
            );
          })()}
          <text x={210} y={24} textAnchor="middle" className="fill-zinc-500 text-[11px]">{t("balance.per100", { amount: f.money(100) })}</text>
          <text x={210} y={50} textAnchor="middle" className="fill-zinc-900 font-mono text-[22px] font-bold dark:fill-zinc-100">{f.money(per100)}</text>
        </svg>
      </div>
    </IndicatorCard>
  );
}

/* 9 — §31 type 12: the grand total if every rate moved 5 points down or up. */
export function TaxSensitivityTrio({ invoices, overview, f }: IndicatorProps) {
  const t = useInd();
  const [low, now, high] = useMemo(() => taxRateSensitivity(invoices, [-5, 0, 5]), [invoices]);
  return (
    <IndicatorCard
      id="sensitivity"
      title={t("trio.title")}
      heading={t("trio.heading")}
      intro={t("trio.intro")}
      fallback={empty(overview)}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("trio.rowNet"), value: f.money(overview.net) },
          { label: t("trio.rowNow"), value: `${f.money(now.tax)} → ${f.money(now.grand)}` },
          { label: t("trio.rowLow"), value: `${f.money(low.tax)} → ${f.money(low.grand)}` },
          { label: t("trio.rowHigh"), value: `${f.money(high.tax)} → ${f.money(high.grand)}` },
          { label: t("trio.rowResult"), value: f.money(high.grand - low.grand), emphasize: true, note: t("trio.note") },
        ],
      }}
    >
      <SensitivityBars
        points={[
          { label: t("trio.low"), sub: f.pct(overview.net ? (low.tax / overview.net) * 100 : 0, 2), value: low.grand, display: f.money(low.grand), delta: f.signed(low.delta) },
          { label: t("trio.now"), sub: f.pct(overview.effectiveTaxRate, 2), value: now.grand, display: f.money(now.grand), delta: f.signed(0) },
          { label: t("trio.high"), sub: f.pct(overview.net ? (high.tax / overview.net) * 100 : 0, 2), value: high.grand, display: f.money(high.grand), delta: f.signed(high.delta) },
        ]}
      />
    </IndicatorCard>
  );
}

function FormulaBox({ k, v, tone }: { k: string; v: string; tone: string }) {
  return (
    <div className={`min-w-0 rounded-xl border-2 px-3 py-2 text-center ${tone}`}>
      <p className="truncate text-[11px] font-semibold uppercase tracking-wide opacity-80">{k}</p>
      <p dir="ltr" className="truncate font-mono text-base font-bold">{v}</p>
    </div>
  );
}

const Op = ({ s }: { s: string }) => <span className="self-center px-1 font-mono text-xl font-bold text-zinc-400">{s}</span>;

/* 10 — §31 type 18: the batch's own formula, filled in with its current numbers. */
export function LiveFormula({ overview, f }: IndicatorProps) {
  const t = useInd();
  const net = "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100";
  const tax = "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100";
  const tot = "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-500/10 dark:text-blue-100";
  const plain = "border-zinc-300 bg-white text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";
  return (
    <IndicatorCard
      id="formula"
      title={t("formula.title")}
      heading={t("formula.heading")}
      intro={t("formula.intro")}
      fallback={empty(overview)}
      worked={{
        title: t("worked"),
        rows: [
          ...overview.perInvoice.slice(0, 5).map((r, i) => ({ label: label(r, i), value: `${f.compact(r.subtotal)} + ${f.compact(r.tax)} = ${f.money(r.total)}` })),
          { label: t("formula.rowSum"), value: overview.perInvoice.map((r) => f.compact(r.total)).join(" + ") },
          { label: t("formula.rowResult"), value: f.money(overview.grand), emphasize: true },
        ],
      }}
    >
      <div className="space-y-3" data-testid="ind-formula">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-1">
          <FormulaBox k={t("formula.lines", { count: overview.itemCount })} v="Σ (qty × price)" tone={plain} />
          <Op s="=" />
          <FormulaBox k={t("net")} v={f.money(overview.net)} tone={net} />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,0.7fr)_auto_minmax(0,1fr)] gap-1">
          <FormulaBox k={t("net")} v={f.money(overview.net)} tone={net} />
          <Op s="×" />
          <FormulaBox k={t("formula.blended")} v={f.pct(overview.effectiveTaxRate, 3)} tone={plain} />
          <Op s="=" />
          <FormulaBox k={t("tax")} v={f.money(overview.tax)} tone={tax} />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1.2fr)] gap-1">
          <FormulaBox k={t("net")} v={f.money(overview.net)} tone={net} />
          <Op s="+" />
          <FormulaBox k={t("tax")} v={f.money(overview.tax)} tone={tax} />
          <Op s="=" />
          <FormulaBox k={t("formula.grand")} v={f.money(overview.grand)} tone={tot} />
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("formula.blendNote")}</p>
      </div>
    </IndicatorCard>
  );
}

export type FxSnapshot = { date: string; perUsd: Record<string, number> } | null;

const FX_TARGETS = ["USD", "EUR", "GBP", "JPY", "CNY", "INR", "CHF", "CAD", "SAR", "AED"];

/* 11 — §31 type 11: the grand total side by side in other currencies (ECB reference rates). */
export function CurrencyEquivalence({ overview, f, fx }: IndicatorProps & { fx: FxSnapshot }) {
  const t = useInd();
  const from = f.currency;
  const fromRate = fx?.perUsd[from];
  const rows = fx && fromRate ? FX_TARGETS.filter((c) => c !== from && fx.perUsd[c]).slice(0, 8).map((c) => ({ code: c, value: convertViaUsd(overview.grand, fromRate, fx.perUsd[c]), rate: fx.perUsd[c] / fromRate })) : [];
  const first = rows[0];
  return (
    <IndicatorCard
      id="currencies"
      title={t("fx.title")}
      heading={t("fx.heading", { amount: f.money(overview.grand) })}
      intro={t("fx.intro")}
      fallback={empty(overview) ?? (!rows.length ? <p className="mt-4 text-sm text-zinc-500">{t("fx.unavailable")}</p> : undefined)}
      worked={
        first
          ? {
              title: t("worked"),
              rows: [
                { label: t("fx.rowGrand"), value: f.money(overview.grand) },
                { label: t("fx.rowRate", { from, to: first.code }), value: `1 ${from} = ${f.num(first.rate, 4)} ${first.code}` },
                { label: t("fx.rowResult", { to: first.code }), value: f.moneyIn(first.value, first.code), emphasize: true, note: t("fx.note", { date: fx!.date }) },
              ],
            }
          : null
      }
    >
      <ul className="grid gap-1.5" data-testid="ind-fx">
        {rows.map((r) => (
          <li key={r.code} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-lg bg-zinc-50 px-2.5 py-1.5 dark:bg-zinc-800/50">
            <span dir="ltr" className="truncate font-mono text-xs text-zinc-600 dark:text-zinc-300">{f.money(overview.grand)}</span>
            <span className="text-xs font-bold text-blue-500">⇄</span>
            <span dir="ltr" className="truncate text-end font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100" data-code={r.code}>
              {f.moneyIn(r.value, r.code)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-zinc-400">{t("fx.source", { date: fx?.date ?? "—" })}</p>
    </IndicatorCard>
  );
}

function regionNamer(locale: string): (code: string) => string {
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return (c) => dn.of(c) ?? c;
  } catch {
    return (c) => c;
  }
}

/* 12 — §31 type 17: standard VAT/GST rates, each row also pricing the visitor's own batch. */
export function VatReferenceTable({ overview, f, onUseRate }: IndicatorProps & { onUseRate: (rate: number) => void }) {
  const t = useInd();
  const locale = useLocale();
  const [picked, setPicked] = useState("SA");
  const regionName = useMemo(() => regionNamer(locale), [locale]);
  const row = VAT_TABLE.find((r) => r.country === picked) ?? VAT_TABLE[0];
  const rate = row.rate ?? 0;
  const at = overview.net * (1 + rate / 100);
  const kindTone = { vat: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300", gst: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300", sales: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300", none: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" };
  return (
    <IndicatorCard
      id="vat-table"
      title={t("vat.title")}
      heading={t("vat.heading")}
      intro={t("vat.intro", { date: VAT_CHECKED })}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("vat.rowCountry"), value: regionName(row.country) },
          { label: t("vat.rowRate"), value: row.rate === null ? t(`vat.kind.${row.kind}`) : f.pct(rate, 2) },
          { label: t("net"), value: f.money(overview.net) },
          { label: t("vat.rowTax"), value: `${f.money(overview.net)} × ${f.pct(rate, 2)} = ${f.money(overview.net * (rate / 100))}` },
          { label: t("vat.rowResult"), value: f.money(at), emphasize: true, note: t("vat.vsNow", { diff: f.signed(at - overview.grand) }) },
        ],
      }}
    >
      <div className="max-h-[30rem] overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-700" data-testid="ind-vat">
        <table className="w-full min-w-[34rem] text-sm">
          <thead className="sticky top-0 bg-zinc-100 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
              <th className="px-3 py-2 text-start">{t("vat.country")}</th>
              <th className="px-2 py-2 text-start">{t("vat.type")}</th>
              <th className="px-2 py-2 text-end">{t("vat.rate")}</th>
              <th className="px-2 py-2 text-end">{t("vat.yourBatch")}</th>
              <th className="px-2 py-2 text-start">{t("vat.source")}</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {VAT_TABLE.map((r) => (
              <tr key={r.country} onClick={() => setPicked(r.country)} className={`cursor-pointer ${r.country === picked ? "bg-blue-50 dark:bg-blue-500/10" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"}`}>
                <td className="px-3 py-1.5">
                  <span className="font-medium text-zinc-800 dark:text-zinc-100">{regionName(r.country)}</span>
                  <span className="ms-1.5 text-[10px] text-zinc-400">{t(`vat.region.${r.region}`)}</span>
                </td>
                <td className="px-2 py-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${kindTone[r.kind]}`}>{t(`vat.kind.${r.kind}`)}</span>
                </td>
                <td dir="ltr" className="px-2 py-1.5 text-end font-mono font-semibold text-zinc-900 dark:text-zinc-100">{r.rate === null ? "—" : f.pct(r.rate, 2)}</td>
                <td dir="ltr" className="px-2 py-1.5 text-end font-mono text-xs text-zinc-700 dark:text-zinc-300">{f.money(overview.net * (1 + (r.rate ?? 0) / 100))}</td>
                <td className="px-2 py-1.5 text-[11px]">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400" onClick={(e) => e.stopPropagation()}>
                    {r.source}
                  </a>
                  {r.since !== "—" && <span dir="ltr" className="block text-[10px] text-zinc-400">{t("vat.since", { date: r.since })}</span>}
                </td>
                <td className="px-2 py-1.5 text-end">
                  {r.rate !== null && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPicked(r.country);
                        onUseRate(r.rate!);
                      }}
                      className="rounded-md border border-blue-300 px-2 py-0.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-500/40 dark:text-blue-300 dark:hover:bg-blue-500/10"
                    >
                      {t("vat.use")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-zinc-400">{t("vat.footnote", { date: VAT_CHECKED })}</p>
    </IndicatorCard>
  );
}
