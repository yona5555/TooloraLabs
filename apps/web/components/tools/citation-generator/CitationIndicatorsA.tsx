"use client";
import { useState, useId } from "react";
import { useTranslations } from "next-intl";
import {
  checkFields,
  CITATION_STYLES,
  completeness,
  formatReference,
  sourceLang,
  type CitationStyleId,
  type CitePart,
  type CiteSource,
} from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { EntryText, fmt } from "./CitationShared";
import { partOrder } from "./CitationStudioResult";
import { PART_COLORS, type StudioState } from "./studio";

export type CiteIndicatorProps = { state: StudioState; onChange: (s: StudioState) => void; source: CiteSource; index: number };

const axisText = "fill-zinc-500 dark:fill-zinc-400";
const valueText = "fill-zinc-800 dark:fill-zinc-100";

export function useCiteT() {
  return useTranslations("tools.citation-generator.studio");
}

/* 1 · Citation anatomy (interactive: pick a style and an element, see it lit in the entry) */
export function CitationAnatomyCard({ state, source, index }: CiteIndicatorProps) {
  const t = useCiteT();
  const [style, setStyle] = useState<CitationStyleId>(state.style);
  const [focus, setFocus] = useState<CitePart | null>("title");
  const segs = formatReference(source, style, index + 1);
  const parts = partOrder(segs);
  const lens = parts.map((p) => ({ p, n: segs.filter((s) => s.part === p).reduce((a, s) => a + s.text.length, 0) }));
  const punct = segs.filter((s) => s.part === "punct").reduce((a, s) => a + s.text.length, 0);
  const total = lens.reduce((a, l) => a + l.n, 0) + punct || 1;
  const W = 400;
  const H = 96;
  const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, l) => a + (l.n / total) * W, 0));
  const usedW = lens.reduce((a, l) => a + (l.n / total) * W, 0);
  const active = focus && parts.includes(focus) ? focus : parts[0];

  return (
    <SectionCard phoneRole="visual" title={t("ind.anatomy.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.anatomy.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <div className="w-[400px] max-w-full">
            <div className="mb-2 flex flex-wrap gap-1">
              {CITATION_STYLES.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStyle(id)}
                  aria-pressed={style === id}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition ${style === id ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"}`}
                >
                  {t(`styles.${id}`)}
                </button>
              ))}
            </div>
            <div className="mb-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
              <EntryText segs={segs} rtl={sourceLang(source) === "ar"} highlight={active} className="font-serif text-sm leading-6 text-zinc-900 dark:text-zinc-50" />
            </div>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.anatomy.title")} className="max-w-full">
              {lens.map((l, li) => {
                const w = (l.n / total) * W;
                const x0 = starts[li];
                const on = l.p === active;
                return (
                  <g key={l.p} onClick={() => setFocus(l.p)} onMouseEnter={() => setFocus(l.p)} style={{ cursor: "pointer" }}>
                    <rect x={x0} y={on ? 4 : 10} width={Math.max(2, w - 2)} height={on ? 44 : 32} rx={5} fill={PART_COLORS[l.p]} fillOpacity={on ? 1 : 0.55} style={{ transition: "all 300ms ease" }} />
                    {w > 26 && (
                      <text x={x0 + w / 2 - 1} y={31} textAnchor="middle" fontSize={10} fontWeight={800} fill="white">
                        {`${fmt((l.n / total) * 100)}%`}
                      </text>
                    )}
                  </g>
                );
              })}
              <rect x={usedW} y={10} width={Math.max(0, W - usedW)} height={32} rx={5} fill="currentColor" fillOpacity={0.12} />
              <text x={0} y={70} fontSize={10} className={axisText}>0</text>
              <text x={W} y={70} textAnchor="end" fontSize={10} className={axisText}>{`${fmt(total)}`}</text>
              <text x={W / 2} y={88} textAnchor="middle" fontSize={11} fontWeight={700} fill={active ? PART_COLORS[active] : undefined}>
                {active ? `${t(`parts.${active}`)} · ${fmt(lens.find((l) => l.p === active)?.n ?? 0)}` : ""}
              </text>
            </svg>
          </div>
        }
        rows={[
          ...lens.map((l, i) => ({ label: `${i + 1}. ${t(`parts.${l.p}`)}`, value: fmt(l.n), note: `${fmt((l.n / total) * 100, 1)}%` })),
          { label: t("ind.anatomy.punct"), value: fmt(punct) },
          { label: t("ind.anatomy.total", { style: t(`styles.${style}`) }), value: fmt(total), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 2 · Completeness gauge for the selected source (gradient gauge) */
export function CitationCompletenessCard({ source }: CiteIndicatorProps) {
  const svgId = useId();
  const t = useCiteT();
  const pct = completeness(source);
  const checks = checkFields(source);
  const W = 260;
  const H = 160;
  const CX = W / 2;
  const CY = 130;
  const R = 100;
  const pt = (f: number, r: number) => [CX - r * Math.cos(f * Math.PI), CY - r * Math.sin(f * Math.PI)] as const;
  const [ex, ey] = pt(pct / 100, R);
  const color = pct >= 90 ? "#10b981" : pct >= 70 ? "#3b82f6" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const req = checks.filter((c) => c.level === "required");
  const rec = checks.filter((c) => c.level === "recommended");
  const label = (f: string) => t(`fields.${f === "container" && source.type === "website" ? "site" : f}`);

  return (
    <SectionCard title={t("ind.complete.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.complete.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <PhoneMini slot={0} title={t("ind.complete.title")}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.complete.title")}>
            <defs>
              <linearGradient id={`${svgId}cite-complete`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="75%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} stroke={`url(#${svgId}cite-complete)`} strokeOpacity={0.25} strokeWidth={18} fill="none" />
            {pct > 0 && <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${ex} ${ey}`} stroke={`url(#${svgId}cite-complete)`} strokeWidth={18} fill="none" strokeLinecap="round" style={{ transition: "d 500ms ease" }} />}
            {[0, 50, 70, 90, 100].map((v) => {
              const [tx, ty] = pt(v / 100, R + 18);
              return (
                <text key={v} x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize={9} className={axisText}>{v}</text>
              );
            })}
            <circle cx={ex} cy={ey} r={7} fill={color} stroke="white" strokeWidth={2} />
            <text x={CX} y={CY - 22} textAnchor="middle" fontSize={30} fontWeight={800} fill={color}>{`${fmt(pct)}%`}</text>
            <text x={CX} y={CY - 4} textAnchor="middle" fontSize={10} className={axisText}>
              {`${fmt(req.filter((c) => c.filled).length)}/${fmt(req.length)} · ${fmt(rec.filter((c) => c.filled).length)}/${fmt(rec.length)}`}
            </text>
          </svg>
          </PhoneMini>
        }
        rows={[
          ...checks.map((c) => ({
            label: `${label(c.field)}${c.level === "required" ? " *" : ""}`,
            value: c.filled ? t("result.ok") : t("result.missing"),
            note: c.level === "required" ? t("ind.complete.weight2") : t("ind.complete.weight1"),
          })),
          { label: t("ind.complete.score"), value: `${fmt(pct)}%`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 3 · Bibliography mix: source types (outer ring) and languages (inner ring) */
export function CitationMixCard({ state }: CiteIndicatorProps) {
  const t = useCiteT();
  const list = state.list.filter((s) => s.title.trim());
  const n = list.length || 1;
  const types = (["journal", "book", "website"] as const).map((k, i) => ({ k, label: t(`types.${k}`), v: list.filter((s) => s.type === k).length, c: ["#2563eb", "#10b981", "#f59e0b"][i] }));
  const ar = list.filter((s) => sourceLang(s) === "ar").length;
  const langs = [
    { k: "en", label: t("ind.mix.latin"), v: list.length - ar, c: "#8b5cf6" },
    { k: "ar", label: t("ind.mix.arabic"), v: ar, c: "#ec4899" },
  ];
  const S = 190;
  const C = S / 2;
  const ring = (items: { v: number; c: string; k: string }[], r: number, w: number) => {
    let a0 = -Math.PI / 2;
    return items.map((it) => {
      const sweep = (it.v / n) * Math.PI * 2;
      const a1 = a0 + sweep;
      const large = sweep > Math.PI ? 1 : 0;
      const p = (a: number) => `${C + r * Math.cos(a)} ${C + r * Math.sin(a)}`;
      const d = it.v >= n ? `M ${C} ${C - r} A ${r} ${r} 0 1 1 ${C - 0.01} ${C - r}` : `M ${p(a0)} A ${r} ${r} 0 ${large} 1 ${p(a1)}`;
      const mid = a0 + sweep / 2;
      a0 = a1;
      return it.v ? (
        <g key={it.k}>
          <path d={d} stroke={it.c} strokeWidth={w} fill="none" style={{ transition: "all 400ms ease" }} />
          {sweep > 0.45 && (
            <text x={C + r * Math.cos(mid)} y={C + r * Math.sin(mid) + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill="white">{fmt(it.v)}</text>
          )}
        </g>
      ) : null;
    });
  };

  return (
    <SectionCard title={t("ind.mix.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.mix.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <PhoneMini slot={1} title={t("ind.mix.title")}>
          <div className="flex items-center gap-4">
            <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} role="img" aria-label={t("ind.mix.title")}>
              {ring(types, 78, 22)}
              {ring(langs, 50, 18)}
              <text x={C} y={C + 2} textAnchor="middle" fontSize={22} fontWeight={800} className={valueText}>{fmt(list.length)}</text>
              <text x={C} y={C + 16} textAnchor="middle" fontSize={9} className={axisText}>{t("ind.mix.sources")}</text>
            </svg>
            <ul className="space-y-1 text-xs">
              {[...types, ...langs].map((it) => (
                <li key={it.k} className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: it.c }} />
                  <span className="text-zinc-600 dark:text-zinc-300">{it.label}</span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-100">{fmt(it.v)}</span>
                </li>
              ))}
            </ul>
          </div>
          </PhoneMini>
        }
        rows={[
          ...types.map((it) => ({ label: it.label, value: fmt(it.v), note: `${fmt((it.v / n) * 100, 1)}%` })),
          ...langs.map((it) => ({ label: it.label, value: fmt(it.v), note: `${fmt((it.v / n) * 100, 1)}%` })),
          { label: t("ind.mix.total"), value: fmt(list.length), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 4 · Source recency on a year axis (timeline with zones for the last 5 and 10 years) */
export function CitationRecencyCard({ state }: CiteIndicatorProps) {
  const t = useCiteT();
  const now = new Date().getFullYear();
  const dated = state.list
    .map((s, i) => ({ i, y: Number.parseInt(s.year, 10), title: s.title }))
    .filter((d) => Number.isFinite(d.y) && d.y > 1000 && d.y <= now + 1)
    .sort((a, b) => a.y - b.y);
  const undated = state.list.filter((s) => s.title.trim()).length - dated.length;
  const minY = Math.min(now - 12, ...dated.map((d) => d.y));
  const W = 400;
  const H = 150;
  const L = 14;
  const R = 14;
  const x = (y: number) => L + ((y - minY) / Math.max(1, now - minY)) * (W - L - R);
  const ys = dated.map((d) => d.y);
  const median = ys.length ? (ys.length % 2 ? ys[(ys.length - 1) / 2] : (ys[ys.length / 2 - 1] + ys[ys.length / 2]) / 2) : now;
  const within = (k: number) => dated.filter((d) => now - d.y <= k).length;
  const stacks = new Map<number, number>();
  const ticks = Array.from(new Set([minY, Math.round((minY + now) / 2), now - 10, now - 5, now])).filter((v) => v >= minY).sort((a, b) => a - b);

  return (
    <SectionCard title={t("ind.recency.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.recency.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.recency.title")} className="max-w-full">
            <rect x={x(now - 10)} y={14} width={x(now) - x(now - 10)} height={86} fill="#3b82f6" fillOpacity={0.1} />
            <rect x={x(now - 5)} y={14} width={x(now) - x(now - 5)} height={86} fill="#10b981" fillOpacity={0.16} />
            <text x={x(now - 5) + 3} y={24} fontSize={9} fill="#059669">≤5</text>
            <text x={x(now - 10) + 3} y={24} fontSize={9} fill="#2563eb">≤10</text>
            <line x1={L} x2={W - R} y1={100} y2={100} stroke="currentColor" strokeOpacity={0.4} />
            {ticks.map((v) => (
              <g key={v}>
                <line x1={x(v)} x2={x(v)} y1={100} y2={105} stroke="currentColor" strokeOpacity={0.4} />
                <text x={x(v)} y={118} textAnchor="middle" fontSize={9} className={axisText}>{v}</text>
              </g>
            ))}
            <line x1={x(median)} x2={x(median)} y1={30} y2={100} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1.5} />
            <text x={x(median)} y={140} textAnchor="middle" fontSize={10} fontWeight={700} fill="#d97706">{`${t("ind.recency.medianShort")} ${fmt(median)}`}</text>
            {dated.map((d) => {
              const k = stacks.get(d.y) ?? 0;
              stacks.set(d.y, k + 1);
              const cy = 88 - k * 18;
              return (
                <g key={d.i} style={{ transition: "all 400ms ease" }}>
                  <circle cx={x(d.y)} cy={cy} r={8} fill={now - d.y <= 5 ? "#10b981" : now - d.y <= 10 ? "#3b82f6" : "#94a3b8"} stroke="white" strokeWidth={1.5} />
                  <text x={x(d.y)} y={cy + 3.5} textAnchor="middle" fontSize={9} fontWeight={800} fill="white">{d.i + 1}</text>
                </g>
              );
            })}
          </svg>
        }
        rows={[
          { label: t("ind.recency.newest"), value: dated.length ? String(dated[dated.length - 1].y) : "—" },
          { label: t("ind.recency.oldest"), value: dated.length ? String(dated[0].y) : "—" },
          { label: t("ind.recency.median"), value: fmt(median), note: t("ind.recency.age", { n: fmt(now - median) }) },
          { label: t("ind.recency.last5"), value: `${fmt(within(5))}/${fmt(dated.length)}` },
          { label: t("ind.recency.last10"), value: `${fmt(within(10))}/${fmt(dated.length)}` },
          { label: t("ind.recency.undated"), value: fmt(Math.max(0, undated)) },
          { label: t("ind.recency.share5"), value: `${fmt(dated.length ? (within(5) / dated.length) * 100 : 0, 1)}%`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}
