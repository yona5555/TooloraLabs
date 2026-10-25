"use client";
import { useState } from "react";
import { ArrowDownAZ } from "lucide-react";
import {
  authorListing,
  CITATION_STYLES,
  formatInText,
  formatReference,
  parseDoi,
  segmentsToText,
  sortBibliography,
  sortKey,
  type CiteSource,
} from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { fmt } from "./CitationShared";
import { useCiteT, type CiteIndicatorProps } from "./CitationIndicatorsA";
import { svgPx } from "@/components/tool-ui/svgPx";
import { useFitWidth } from "@/components/tool-ui/useFitWidth";

const axisText = "fill-zinc-500 dark:fill-zinc-400";
const valueText = "fill-zinc-800 dark:fill-zinc-100";
const STYLE_COLORS = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

/* 5 · Persistent identifiers across the bibliography (stacked segmented bar) */
export function CitationIdentifierCard({ state }: CiteIndicatorProps) {
  const t = useCiteT();
  const list = state.list.filter((s) => s.title.trim());
  const kind = (s: CiteSource) => (parseDoi(s.doi) ? "doi" : s.isbn.trim() ? "isbn" : s.url.trim() ? "url" : "none");
  const cats = [
    { k: "doi", c: "#10b981" },
    { k: "isbn", c: "#3b82f6" },
    { k: "url", c: "#f59e0b" },
    { k: "none", c: "#ef4444" },
  ].map((c) => ({ ...c, items: list.map((s, i) => ({ s, i })).filter(({ s }) => kind(s) === c.k) }));
  const n = list.length || 1;
  const [fitRef, W] = useFitWidth(400);
  const H = 132;
  const BW = W - 8;
  const blocks = cats.flatMap((c) => c.items.map(({ i }) => ({ k: c.k, c: c.c, i })));
  const persistent = cats[0].items.length + cats[1].items.length;

  return (
    <SectionCard title={t("ind.ids.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.ids.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.ids.title")} className="max-w-full">
            {blocks.map((b, bi) => {
              const w = BW / n;
              const x0 = 4 + bi * w;
              return (
                <g key={`${b.k}${b.i}`}>
                  <rect x={x0} y={20} width={w - 3} height={44} rx={6} fill={b.c} style={{ transition: "all 400ms ease" }} />
                  <text style={{ fontSize: svgPx(12) }} x={x0 + (w - 3) / 2} y={47} textAnchor="middle" fontWeight={800} fill="white">{b.i + 1}</text>
                </g>
              );
            })}
            <text style={{ fontSize: svgPx(12) }} x={4} y={12} fontWeight={700} className={valueText}>{`${fmt((persistent / n) * 100)}% DOI/ISBN`}</text>
            {cats.map((c, ci) => (
              <g key={c.k} transform={`translate(${4 + ci * Math.min(99, (W - 8) / 4)}, 84)`}>
                <rect width={12} height={12} rx={3} fill={c.c} />
                <text style={{ fontSize: svgPx(12) }} x={17} y={10} fontWeight={700} className={valueText}>{`${c.k === "none" ? "—" : c.k.toUpperCase()} ${fmt(c.items.length)}`}</text>
              </g>
            ))}
            <text style={{ fontSize: svgPx(12) }} x={4} y={120} className={axisText}>{t("ind.ids.axis")}</text>
          </svg>
        }
        rows={[
          ...cats.map((c) => ({ label: t(`ind.ids.${c.k}`), value: fmt(c.items.length), note: `${fmt((c.items.length / n) * 100, 1)}%` })),
          { label: t("ind.ids.persistent"), value: `${fmt(persistent)}/${fmt(list.length)}`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 6 · Entry length of this source in each style (labeled bar chart) */
export function CitationLengthCard({ state, source, index }: CiteIndicatorProps) {
  const t = useCiteT();
  const rows = CITATION_STYLES.map((id, i) => ({
    id,
    ref: segmentsToText(formatReference(source, id, index + 1)).length,
    inText: formatInText(source, id, { page: state.page, index: index + 1 }).length,
    c: STYLE_COLORS[i],
  }));
  const max = Math.max(1, ...rows.map((r) => r.ref));
  const [fitRef, W] = useFitWidth(400);
  const H = 210;
  const B = 30;
  const bw = (W - 20) / rows.length;
  const shortest = [...rows].sort((a, b) => a.ref - b.ref)[0];

  return (
    <SectionCard title={t("ind.length.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.length.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.length.title")} className="max-w-full">
            {rows.map((r, i) => {
              const h = (r.ref / max) * (H - B - 30);
              const hi = (r.inText / max) * (H - B - 30);
              const cx = 10 + i * bw + bw / 2;
              const on = r.id === state.style;
              return (
                <g key={r.id}>
                  <rect x={cx - bw * 0.32} y={H - B - h} width={bw * 0.42} height={h} rx={4} fill={r.c} fillOpacity={on ? 1 : 0.6} style={{ transition: "all 400ms ease" }} />
                  <rect x={cx + bw * 0.13} y={H - B - hi} width={bw * 0.2} height={Math.max(1, hi)} rx={3} fill={r.c} fillOpacity={0.3} />
                  <text style={{ fontSize: svgPx(12) }} x={cx - bw * 0.11} y={H - B - h - 5} textAnchor="middle" fontWeight={800} className={valueText}>{fmt(r.ref)}</text>
                  <text style={{ fontSize: svgPx(12) }} x={cx + bw * 0.23} y={H - B - hi - 4} textAnchor="middle" className={axisText}>{fmt(r.inText)}</text>
                  <text style={{ fontSize: svgPx(12) }} x={cx} y={H - B + 16} textAnchor="middle" fontWeight={on ? 800 : 600} className={valueText}>{t(`styles.${r.id}`)}</text>
                </g>
              );
            })}
          </svg>
        }
        rows={[
          ...rows.map((r) => ({ label: t(`styles.${r.id}`), value: fmt(r.ref), note: t("ind.length.inText", { n: fmt(r.inText) }) })),
          { label: t("ind.length.shortest"), value: t(`styles.${shortest.id}`), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

const SURNAMES = ["Smith", "Ali", "García", "Chen", "Khan", "Müller", "Rossi", "Kim", "Silva", "Haddad", "Novak", "Sato", "Dubois", "Patel", "Nguyen", "Ahmed", "Kowalski", "Hansen", "Costa", "Ivanova", "Okafor", "Lopez", "Schmidt", "Yilmaz", "Brown"];

/* 7 · Author-count thresholds (interactive slider: how many names each style lists) */
export function CitationAuthorsCard({ source }: CiteIndicatorProps) {
  const t = useCiteT();
  const own = source.authors.filter((a) => a.family.trim() || a.given.trim()).length;
  const [n, setN] = useState(Math.max(1, Math.min(25, own || 3)));
  const dummy: CiteSource = { ...source, authors: SURNAMES.slice(0, n).map((family) => ({ family, given: "Alex" })) };
  const [fitRef, W] = useFitWidth(400);
  const LW = 64;
  const RH = 34;
  const H = CITATION_STYLES.length * RH + 6;
  const cell = Math.min(13, (W - LW - 8) / 25);

  return (
    <SectionCard title={t("ind.authors.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.authors.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <div className="w-[400px] max-w-full">
            <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.authors.title")} className="max-w-full">
              {CITATION_STYLES.map((id, ri) => {
                const L = authorListing(id, n);
                const y = ri * RH + 4;
                return (
                  <g key={id}>
                    <text style={{ fontSize: svgPx(12) }} x={0} y={y + 12} fontWeight={700} className={valueText}>{t(`styles.${id}`)}</text>
                    <text style={{ fontSize: svgPx(12) }} x={0} y={y + 25} className={axisText}>{L.inTextEtAl ? "et al." : id === "ieee" ? "[n]" : `${L.inTextListed}`}</text>
                    {Array.from({ length: n }, (_, i) => {
                      const listed = L.refEllipsis ? i < 19 || i === n - 1 : i < L.refListed;
                      const gap = L.refEllipsis && i >= 19 && i < n - 1;
                      return (
                        <rect
                          key={i}
                          x={LW + i * cell}
                          y={y + 4}
                          width={cell - 2}
                          height={RH - 14}
                          rx={2}
                          fill={listed ? STYLE_COLORS[ri] : "transparent"}
                          stroke={STYLE_COLORS[ri]}
                          strokeOpacity={gap ? 0.25 : 0.7}
                          strokeDasharray={gap ? "2 2" : undefined}
                          style={{ transition: "fill 250ms ease" }}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>
            <label className="mt-2 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              {t("ind.authors.slider")}: <span dir="ltr" className="font-mono text-blue-700 dark:text-blue-300">{fmt(n)}</span>
              <input type="range" min={1} max={25} step={1} value={n} onChange={(e) => setN(Number(e.target.value))} className="mt-1 w-full accent-blue-600" />
            </label>
          </div>
        }
        rows={[
          ...CITATION_STYLES.map((id) => {
            const L = authorListing(id, n);
            return {
              label: t(`styles.${id}`),
              value: formatInText(dummy, id, { index: 1 }),
              note: L.refEllipsis ? t("ind.authors.ellipsis") : L.refEtAl ? t("ind.authors.etAl", { n: fmt(L.refListed) }) : t("ind.authors.all", { n: fmt(L.refListed) }),
            };
          }),
          { label: t("ind.authors.count"), value: fmt(n), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 8 · Citation order vs alphabetical order (slope chart; IEEE numbers by order of citation) */
export function CitationOrderCard({ state, onChange }: CiteIndicatorProps) {
  const t = useCiteT();
  const list = state.list;
  const sorted = sortBibliography(list);
  const rank = new Map(sorted.map((s, i) => [s.id, i]));
  const [fitRef, W] = useFitWidth(400);
  const RH = 30;
  const H = Math.max(2, list.length) * RH + 30;
  // the two columns follow the drawing width; on a narrow card the labels are cut shorter so they stay inside
  const xl = W * 0.3;
  const xr = W * 0.7;
  const maxChars = W >= 400 ? 16 : Math.max(6, Math.floor((xl - 18) / 6.6));
  const y = (i: number) => 30 + i * RH;
  const moved = list.filter((s, i) => rank.get(s.id) !== i).length;
  const label = (s: CiteSource) => {
    const k = sortKey(s) || "—";
    return k.length > maxChars ? `${k.slice(0, maxChars - 1)}…` : k;
  };

  return (
    <SectionCard title={t("ind.order.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.order.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <div className="w-[400px] max-w-full">
            <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.order.title")} className="max-w-full">
              <text style={{ fontSize: svgPx(12) }} x={xl} y={14} textAnchor="middle" fontWeight={700} className={axisText}>IEEE [n]</text>
              <text style={{ fontSize: svgPx(12) }} x={xr} y={14} textAnchor="middle" fontWeight={700} className={axisText}>A–Z</text>
              {list.map((s, i) => {
                const r = rank.get(s.id) ?? i;
                const same = r === i;
                return (
                  <g key={s.id}>
                    <line x1={xl} y1={y(i)} x2={xr} y2={y(r)} stroke={same ? "#10b981" : "#f59e0b"} strokeWidth={2} style={{ transition: "all 400ms ease" }} />
                    <circle cx={xl} cy={y(i)} r={9} fill="#2563eb" />
                    <text style={{ fontSize: svgPx(12) }} x={xl} y={y(i) + 3.5} textAnchor="middle" fontWeight={800} fill="white">{i + 1}</text>
                    <text style={{ fontSize: svgPx(12) }} x={xl - 14} y={y(i) + 3.5} textAnchor="end" className={valueText}>{label(s)}</text>
                    <circle cx={xr} cy={y(r)} r={9} fill={same ? "#10b981" : "#f59e0b"} />
                    <text style={{ fontSize: svgPx(12) }} x={xr} y={y(r) + 3.5} textAnchor="middle" fontWeight={800} fill="white">{r + 1}</text>
                    <text style={{ fontSize: svgPx(12) }} x={xr + 14} y={y(r) + 3.5} className={valueText}>{label(s)}</text>
                  </g>
                );
              })}
            </svg>
            <button
              type="button"
              disabled={moved === 0}
              onClick={() => onChange({ ...state, list: sorted })}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              <ArrowDownAZ size={14} />
              {t("bib.sort")}
            </button>
          </div>
        }
        rows={[
          ...list.map((s, i) => ({ label: label(s), value: `${fmt(i + 1)} → ${fmt((rank.get(s.id) ?? i) + 1)}` })),
          { label: t("ind.order.moved"), value: `${fmt(moved)}/${fmt(list.length)}`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}
