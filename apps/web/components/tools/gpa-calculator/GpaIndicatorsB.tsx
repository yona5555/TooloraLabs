"use client";
import { useState, useId } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber } from "@tooloralabs/core";
import { buildTimeline, convertSaudiGpa, GPA_SCALES, gradeForPercent, retakeImpact, type GpaRetakePolicy } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { courseLetter, HONOR_COLORS } from "./planner";
import { useIndicatorT, type IndicatorProps } from "./GpaIndicatorsA";
import { svgPx } from "@/components/tool-ui/svgPx";
import { useFitWidth } from "@/components/tool-ui/useFitWidth";

import FitSvg from "@/components/tool-ui/FitSvg";
const axisText = "fill-zinc-500 dark:fill-zinc-400";
const valueText = "fill-zinc-800 dark:fill-zinc-100";
const field =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

/** Before/after (or actual/what-if) comparison bars on the selected scale. */
function CompareBars({
  rows,
  lo,
  hi,
  fmt,
}: {
  rows: { label: string; before: number; after: number }[];
  lo: number;
  hi: number;
  fmt: (v: number) => string;
}) {
  const [fitRef, W] = useFitWidth(400);
  const RH = 58;
  const L = 8;
  const R = 56;
  const H = rows.length * RH + 6;
  const x = (v: number) => L + ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * (W - L - R);
  return (
    <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} className="max-w-full">
      {rows.map((r, i) => {
        const yy = i * RH;
        const delta = r.after - r.before;
        const up = delta >= 0;
        return (
          <g key={i}>
            <text style={{ fontSize: svgPx(12) }} x={L} y={yy + 11} fontWeight={700} className={valueText}>{r.label}</text>
            <rect x={L} y={yy + 16} width={W - L - R} height={14} rx={4} fill="currentColor" fillOpacity={0.08} />
            <rect x={L} y={yy + 16} width={x(r.before) - L} height={14} rx={4} fill="#94a3b8" style={{ transition: "width 400ms ease" }} />
            <text style={{ fontSize: svgPx(12) }} x={x(r.before) + 4} y={yy + 27} fontWeight={700} className={valueText}>{fmt(r.before)}</text>
            <rect x={L} y={yy + 34} width={x(r.after) - L} height={14} rx={4} fill={up ? "#10b981" : "#ef4444"} style={{ transition: "width 400ms ease" }} />
            <text style={{ fontSize: svgPx(12) }} x={x(r.after) + 4} y={yy + 45} fontWeight={700} className={valueText}>{fmt(r.after)}</text>
            <text style={{ fontSize: svgPx(12) }} x={W - 4} y={yy + 37} textAnchor="end" fontWeight={800} fill={up ? "#059669" : "#dc2626"}>
              {`${up ? "▲" : "▼"}${fmt(Math.abs(delta))}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* 5 · Course retake simulator */
export function GpaRetakeCard({ state, setState, d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const tp = useTranslations("tools.gpa-calculator.planner");
  const options = state.semesters.flatMap((s, si) =>
    s.courses.map((c, ci) => ({ key: c.id, si, ci, label: `S${si + 1} · ${c.name || tp("input.courseN", { n: ci + 1 })} (${courseLetter(state, c)})` })),
  );
  const lowest = [...options].sort((a, b) => d.terms[a.si][a.ci].points - d.terms[b.si][b.ci].points)[0];
  const [pick, setPick] = useState<string | null>(null);
  const sel = options.find((o) => o.key === pick) ?? lowest;
  const [newLetter, setNewLetter] = useState<string | null>(null);
  const course = d.terms[sel.si][sel.ci];
  const target = d.scale.grades.find((g) => g.letter === newLetter) ?? d.scale.grades[0];
  const res = retakeImpact(d.cumulativeQualityPoints, d.cumulativeCredits, course, target.points, state.retakePolicy);
  const formula =
    state.retakePolicy === "replace"
      ? `(${f.num(d.cumulativeQualityPoints)} − ${f.num(course.credits)}×${f.gpa(course.points)} + ${f.num(course.credits)}×${f.gpa(target.points)}) ÷ ${f.num(d.cumulativeCredits)}`
      : `(${f.num(d.cumulativeQualityPoints)} + ${f.num(course.credits)}×${f.gpa(target.points)}) ÷ ${f.num(res.creditsAfter)}`;

  return (
    <SectionCard title={t("retake.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("retake.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-[400px] max-w-full space-y-2">
            <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-2">
              <select value={sel.key} onChange={(e) => setPick(e.target.value)} className={field} aria-label={t("retake.course")}>
                {options.map((o) => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
              <select value={target.letter} onChange={(e) => setNewLetter(e.target.value)} className={field} dir="ltr" aria-label={t("retake.newGrade")}>
                {d.scale.grades.map((g) => (
                  <option key={g.letter} value={g.letter}>{g.letter} · {g.points.toFixed(2)}</option>
                ))}
              </select>
            </div>
            <div role="radiogroup" className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" data-bp-inner>
              {(["average", "replace"] as GpaRetakePolicy[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={state.retakePolicy === p}
                  onClick={() => setState({ ...state, retakePolicy: p })}
                  className={`rounded-md px-2 py-1.5 text-xs font-semibold transition ${
                    state.retakePolicy === p ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {t(`retake.policy.${p}`)}
                </button>
              ))}
            </div>
            <CompareBars rows={[{ label: t("retake.cumulative"), before: res.before, after: res.after }]} lo={d.scale.min} hi={d.scale.max} fmt={f.gpa} />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t(`retake.policyNote.${state.retakePolicy}`)}</p>
          </div>
        }
        rows={[
          { label: t("retake.old"), value: `${courseLetter(state, state.semesters[sel.si].courses[sel.ci])} · ${f.gpa(course.points)}`, note: `${f.num(course.credits)} ${tp("result.creditsUnit")}` },
          { label: t("retake.newGrade"), value: `${target.letter} · ${f.gpa(target.points)}` },
          { label: t("retake.before"), value: f.gpa(res.before) },
          { label: t("retake.after"), value: f.gpa(res.after), note: formula },
          { label: t("retake.change"), value: f.signed(res.delta), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 6 · Honors zone strip */
export function GpaHonorsStripCard({ d, f }: IndicatorProps) {
  const svgId = useId();
  const t = useIndicatorT();
  const tp = useTranslations("tools.gpa-calculator.planner");
  const [fitRef, W] = useFitWidth(400);
  const H = 130;
  const L = 12;
  const R = 12;
  const lo = d.scale.min;
  const hi = d.scale.max;
  const x = (v: number) => L + ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * (W - L - R);
  const bounds = [hi, ...d.scale.honors.map((h) => h.min), lo];
  const zones = bounds.slice(0, -1).map((top, i) => ({ from: bounds[i + 1], to: top, color: HONOR_COLORS[i] ?? "#a1a1aa", honor: i < d.scale.honors.length }));
  const nextGap = d.honorPlans.filter((h) => !h.met).pop();

  return (
    <SectionCard title={t("honors.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("honors.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <FitSvg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("honors.title")} className="max-w-full">
            {zones.map((z, i) => (
              <g key={i}>
                <rect x={x(z.from)} y={40} width={x(z.to) - x(z.from)} height={26} fill={z.honor ? z.color : "currentColor"} fillOpacity={z.honor ? 0.85 : 0.12} />
                <text style={{ fontSize: svgPx(12) }} x={(x(z.from) + x(z.to)) / 2} y={57} textAnchor="middle" fontWeight={700} className={z.honor ? "fill-white" : axisText}>
                  {z.honor ? `${i + 1}` : "—"}
                </text>
                <text style={{ fontSize: svgPx(12) }} x={x(z.from)} y={82} textAnchor="middle" className={axisText}>{z.from.toFixed(2)}</text>
              </g>
            ))}
            <text style={{ fontSize: svgPx(12) }} x={x(hi)} y={82} textAnchor="end" className={axisText}>{hi.toFixed(2)}</text>
            <g style={{ transform: `translateX(${x(d.cumulativeGpa)}px)`, transition: "transform 500ms ease" }}>
              <path d="M 0 36 L -7 22 L 7 22 Z" fill="#1d4ed8" />
              <text style={{ fontSize: svgPx(12) }} x={0} y={16} textAnchor="middle" fontWeight={800} fill="#1d4ed8">{f.gpa(d.cumulativeGpa)}</text>
              <line x1={0} x2={0} y1={36} y2={70} stroke="#1d4ed8" strokeWidth={2} />
            </g>
            {nextGap && (
              <g>
                <line x1={x(d.cumulativeGpa)} x2={x(nextGap.min)} y1={98} y2={98} stroke="#f59e0b" strokeWidth={2} markerEnd={`url(#${svgId}gpa-gap-arrow)`} />
                <defs>
                  <marker id={`${svgId}gpa-gap-arrow`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="#f59e0b" />
                  </marker>
                </defs>
                <text style={{ fontSize: svgPx(12) }} x={(x(d.cumulativeGpa) + x(nextGap.min)) / 2} y={116} textAnchor="middle" fontWeight={700} fill="#d97706">
                  {`+${f.gpa(nextGap.gap)}`}
                </text>
              </g>
            )}
            {d.scale.honors.map((h, i) => (
              <g key={h.key}>
                <rect x={W - R - 120 + i * 40} y={H - 10} width={8} height={8} fill={HONOR_COLORS[i]} />
                <text style={{ fontSize: svgPx(12) }} x={W - R - 109 + i * 40} y={H - 3} className={axisText}>{i + 1}</text>
              </g>
            ))}
          </FitSvg>
        }
        rows={[
          { label: t("honors.current"), value: f.gpa(d.cumulativeGpa), note: d.honors.current ? tp(`honors.${d.honors.current}`) : tp("honors.none") },
          ...d.honorPlans.map((h, i) => ({
            label: `${i + 1} · ${tp(`honors.${h.key}`)} ≥ ${f.gpa(h.min)}`,
            value: h.met ? tp("result.met") : tp("result.gap", { gap: f.gpa(h.gap) }),
            note: h.met
              ? undefined
              : h.plan.status === "impossible"
                ? h.plan.semestersAtMax === null
                  ? tp("verdict.never")
                  : tp("verdict.impossible", { n: h.plan.semestersAtMax })
                : t("honors.needNext", { gpa: f.gpa(h.plan.required), credits: f.num(d.plannedCredits) }),
          })),
          { label: t("honors.conditions"), value: t(`honors.conditionsValue.${d.scale.id}`), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 7 · Scale converter (tagged reference table, live counts from the student's courses) */
export function GpaConverterCard({ state, d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const cuts = [95, 90, 85, 80, 75, 70, 66, 65, 60, 0];
  const counts = new Map<number, number>();
  state.semesters.forEach((s, si) =>
    s.courses.forEach((c, ci) => {
      if (d.terms[si][ci].credits <= 0) return;
      const pct =
        state.entry === "percent"
          ? parseLocalizedNumber(c.percent) || 0
          : (GPA_SCALES[state.scale].grades.find((g) => g.letter === c.letter)?.minPercent ?? 0);
      const cut = cuts.find((k) => pct >= k) ?? 0;
      counts.set(cut, (counts.get(cut) ?? 0) + 1);
    }),
  );
  const conv = state.scale === "us4" ? null : convertSaudiGpa(d.cumulativeGpa, state.scale, state.scale === "sa5" ? "sa4" : "sa5");
  const cell = "px-2 py-1.5 text-center font-mono";

  return (
    <SectionCard title={t("converter.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("converter.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div tabIndex={0} className="w-[420px] max-w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
            <table dir="ltr" className="w-full text-xs">
              <thead className="bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200">
                <tr>
                  <th className="px-2 py-1.5">%</th>
                  <th className="px-2 py-1.5">5.00</th>
                  <th className="px-2 py-1.5">4.00 SA</th>
                  <th className="px-2 py-1.5">4.00 US</th>
                  <th className="px-2 py-1.5">#</th>
                </tr>
              </thead>
              <tbody>
                {cuts.map((cut, i) => {
                  const upper = i === 0 ? 100 : cuts[i - 1];
                  const a = gradeForPercent("sa5", cut);
                  const b = gradeForPercent("sa4", cut);
                  const u = gradeForPercent("us4", cut);
                  const n = counts.get(cut) ?? 0;
                  return (
                    <tr key={cut} className={`border-t border-zinc-100 dark:border-zinc-700/60 ${n ? "bg-amber-50 dark:bg-amber-500/10" : ""}`}>
                      <td className={cell}>{i === 0 ? `${cut}–100` : `${cut}–<${upper}`}</td>
                      <td className={cell}>{a.letter} · {a.points.toFixed(2)}</td>
                      <td className={cell}>{b.points.toFixed(2)}</td>
                      <td className={cell}>{u.letter} · {u.points.toFixed(1)}</td>
                      <td className={`${cell} font-bold`}>
                        {n ? <span className="rounded bg-amber-500 px-1.5 text-white">{n}</span> : <span className="text-zinc-300 dark:text-zinc-600">0</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        }
        rows={[
          { label: t("converter.example"), value: "92% → A", note: "4.75 / 3.75 / A 4.0" },
          { label: t("converter.rule"), value: "5.00 − 1 = 4.00", note: t("converter.ruleNote") },
          {
            label: t("converter.yourGpa"),
            value: conv === null ? t("converter.noOfficial") : `${f.gpa(d.cumulativeGpa)} → ${f.gpa(conv)}`,
            note: conv === null ? undefined : state.scale === "sa5" ? "5.00 → 4.00" : "4.00 → 5.00",
            emphasize: true,
          },
        ]}
      />
    </SectionCard>
  );
}

/* 8 · What-if grade slider per course (current semester) */
export function GpaWhatIfCard({ state, d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const tp = useTranslations("tools.gpa-calculator.planner");
  const grades = d.scale.grades;
  const si = state.semesters.length - 1;
  const sem = state.semesters[si];
  const [over, setOver] = useState<Record<string, number>>({});
  const idxOf = (letter: string) => Math.max(0, grades.findIndex((g) => g.letter === letter));
  const terms = d.terms.map((term, i) =>
    i === si ? term.map((c, ci) => (sem.courses[ci].id in over ? { ...c, points: grades[over[sem.courses[ci].id]].points } : c)) : term,
  );
  const tl = buildTimeline(d.priorGpa, d.priorCredits, terms);
  const whatSem = tl[tl.length - 1]?.gpa ?? 0;
  const whatCum = tl[tl.length - 1]?.cumulativeGpa ?? 0;
  const changed = sem.courses.filter((c) => c.id in over && over[c.id] !== idxOf(courseLetter(state, c)));

  return (
    <SectionCard title={t("whatIf.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("whatIf.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-[400px] max-w-full space-y-1.5">
            {sem.courses.map((c, ci) => {
              const actual = idxOf(courseLetter(state, c));
              const v = over[c.id] ?? actual;
              return (
                <label key={c.id} className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)_3.5rem] items-center gap-2 text-xs">
                  <span className="min-w-0 break-words font-semibold text-zinc-700 dark:text-zinc-200">{c.name || tp("input.courseN", { n: ci + 1 })}</span>
                  <input
                    type="range"
                    min={0}
                    max={grades.length - 1}
                    step={1}
                    dir="ltr"
                    value={grades.length - 1 - v}
                    onChange={(e) => setOver({ ...over, [c.id]: grades.length - 1 - Number(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                  <span dir="ltr" className={`text-end font-mono font-bold ${v !== actual ? "text-amber-600 dark:text-amber-400" : "text-zinc-700 dark:text-zinc-200"}`}>
                    {grades[v].letter}
                  </span>
                </label>
              );
            })}
            <CompareBars
              rows={[
                { label: t("whatIf.semester"), before: d.last?.gpa ?? 0, after: whatSem },
                { label: t("whatIf.cumulative"), before: d.cumulativeGpa, after: whatCum },
              ]}
              lo={d.scale.min}
              hi={d.scale.max}
              fmt={f.gpa}
            />
            <button type="button" onClick={() => setOver({})} className="text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300">
              {t("whatIf.reset")}
            </button>
          </div>
        }
        rows={[
          ...(changed.length
            ? changed.map((c) => ({ label: c.name || tp("input.course"), value: `${courseLetter(state, c)} → ${grades[over[c.id]].letter}` }))
            : [{ label: t("whatIf.changes"), value: t("whatIf.none") }]),
          { label: t("whatIf.semester"), value: `${f.gpa(d.last?.gpa ?? 0)} → ${f.gpa(whatSem)}` },
          { label: t("whatIf.cumulative"), value: `${f.gpa(d.cumulativeGpa)} → ${f.gpa(whatCum)}`, note: `${f.num(tl[tl.length - 1]?.cumulativeQualityPoints ?? 0)} ÷ ${f.num(d.cumulativeCredits)}` },
          { label: t("whatIf.delta"), value: f.signed(whatCum - d.cumulativeGpa), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}
