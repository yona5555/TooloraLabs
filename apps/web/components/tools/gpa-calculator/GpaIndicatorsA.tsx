"use client";
import { useTranslations } from "next-intl";
import { courseContributions, planTarget } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { courseLetter, HONOR_COLORS, type Derived, type Formatters, type PlannerState } from "./planner";
import { svgPx } from "@/components/tool-ui/svgPx";
import { useFitWidth } from "@/components/tool-ui/useFitWidth";

export type IndicatorProps = { state: PlannerState; setState: (s: PlannerState) => void; d: Derived; f: Formatters };

const axisText = "fill-zinc-500 dark:fill-zinc-400";
const valueText = "fill-zinc-800 dark:fill-zinc-100";

export function useIndicatorT() {
  return useTranslations("tools.gpa-calculator.planner.ind");
}

/* 1 · GPA trend by semester (trend line with highlighted reference point) */
export function GpaTrendCard({ d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const tp = useTranslations("tools.gpa-calculator.planner");
  const [fitRef, W] = useFitWidth(400);
  const H = 230;
  const L = 34;
  const R = 12;
  const T = 14;
  const B = 28;
  const lo = d.scale.min;
  const hi = d.scale.max;
  const pts = [
    ...(d.priorCredits > 0 ? [{ label: "0", sem: null as number | null, cum: d.priorGpa }] : []),
    ...d.timeline.map((p, i) => ({ label: String(i + 1), sem: p.gpa as number | null, cum: p.cumulativeGpa })),
  ];
  const n = pts.length;
  const x = (i: number) => L + ((i + 0.5) * (W - L - R)) / n;
  const y = (v: number) => T + (1 - (Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * (H - T - B);
  const bw = Math.min(34, ((W - L - R) / n) * 0.45);
  const best = d.timeline.reduce((bi, p, i, a) => (p.gpa > a[bi].gpa ? i : bi), 0);

  return (
    <SectionCard title={t("trend.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("trend.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <PhoneMini slot={0} title={t("trend.title")}>
          <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("trend.title")} className="max-w-full">
            {[lo, ...d.scale.honors.map((h) => h.min), hi].map((v) => (
              <g key={v}>
                <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={0.12} />
                <text style={{ fontSize: svgPx(12) }} x={L - 4} y={y(v) + 3} textAnchor="end" className={axisText}>{v.toFixed(2)}</text>
              </g>
            ))}
            {d.scale.honors.map((h, i) => (
              <line key={h.key} x1={L} x2={W - R} y1={y(h.min)} y2={y(h.min)} stroke={HONOR_COLORS[i]} strokeDasharray="5 3" strokeWidth={1.5} />
            ))}
            {pts.map((p, i) =>
              p.sem === null ? null : (
                <g key={`b${i}`}>
                  <rect
                    x={x(i) - bw / 2}
                    y={y(p.sem)}
                    width={bw}
                    height={y(lo) - y(p.sem)}
                    rx={3}
                    fill="#f59e0b"
                    fillOpacity={i - (n - d.timeline.length) === best ? 0.95 : 0.55}
                    style={{ transition: "all 500ms ease" }}
                  />
                  <text style={{ fontSize: svgPx(12) }} x={x(i)} y={y(p.sem) - 4} textAnchor="middle" fontWeight={700} className={valueText}>{f.gpa(p.sem)}</text>
                </g>
              ),
            )}
            <polyline points={pts.map((p, i) => `${x(i)},${y(p.cum)}`).join(" ")} fill="none" stroke="#2563eb" strokeWidth={2.5} style={{ transition: "all 500ms ease" }} />
            {pts.map((p, i) => (
              <g key={`c${i}`}>
                <circle cx={x(i)} cy={y(p.cum)} r={i === n - 1 ? 6 : 4} fill="#2563eb" stroke="white" strokeWidth={1.5} />
                <text style={{ fontSize: svgPx(12) }} x={x(i) + 8} y={y(p.cum) + 12} fontWeight={700} fill="#2563eb">{f.gpa(p.cum)}</text>
                <text style={{ fontSize: svgPx(12) }} x={x(i)} y={H - 10} textAnchor="middle" className={axisText}>{p.label === "0" ? "◦" : `S${p.label}`}</text>
              </g>
            ))}
          </svg>
          </PhoneMini>
        }
        rows={[
          ...(d.priorCredits > 0 ? [{ label: t("trend.prior"), value: f.gpa(d.priorGpa), note: `${f.num(d.priorCredits)} ${tp("result.creditsUnit")}` }] : []),
          ...d.timeline.map((p, i) => ({
            label: tp("semesterN", { n: i + 1 }),
            value: `${f.gpa(p.gpa)} → ${f.gpa(p.cumulativeGpa)}`,
            note: `${f.num(p.qualityPoints)} ÷ ${f.num(p.credits)}`,
          })),
          { label: t("trend.legend"), value: t("trend.legendValue"), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 2 · Credit-weighted contribution of each course (ranked diverging bars) */
export function GpaContributionCard({ state, d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const tp = useTranslations("tools.gpa-calculator.planner");
  const sem = state.semesters[state.semesters.length - 1];
  const courses = d.terms[d.terms.length - 1];
  const contrib = courseContributions(courses);
  const rows = sem.courses
    .map((c, i) => ({ name: c.name || tp("input.courseN", { n: i + 1 }), letter: courseLetter(state, c), ...courses[i], ...contrib[i] }))
    .sort((a, b) => b.pull - a.pull);
  const maxAbs = Math.max(0.05, ...rows.map((r) => Math.abs(r.pull)));
  const [fitRef, W] = useFitWidth(400);
  const RH = 30;
  const H = rows.length * RH + 24;
  const mid = W / 2;
  const scale = (W / 2 - 50) / maxAbs;
  const semGpa = d.last?.gpa ?? 0;
  const top = rows[0];

  return (
    <SectionCard title={t("contribution.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("contribution.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <PhoneMini slot={1} title={t("contribution.title")}>
          <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("contribution.title")} className="max-w-full">
            <line x1={mid} x2={mid} y1={0} y2={H - 18} stroke="currentColor" strokeOpacity={0.35} />
            {rows.map((r, i) => {
              const w = Math.abs(r.pull) * scale;
              const pos = r.pull >= 0;
              const yy = i * RH + 4;
              return (
                <g key={i}>
                  <rect x={pos ? mid : mid - w} y={yy} width={Math.max(1, w)} height={RH - 10} rx={3} fill={pos ? "#10b981" : "#ef4444"} style={{ transition: "all 400ms ease" }} />
                  <text style={{ fontSize: svgPx(12) }} x={pos ? mid - 6 : mid + 6} y={yy + 14} textAnchor={pos ? "end" : "start"} className={valueText}>
                    {r.name.length > 18 ? `${r.name.slice(0, 17)}…` : r.name} · {r.letter}
                  </text>
                  <text style={{ fontSize: svgPx(12) }} x={pos ? mid + w + 4 : mid - w - 4} y={yy + 14} textAnchor={pos ? "start" : "end"} fontWeight={700} fill={pos ? "#059669" : "#dc2626"}>
                    {f.signed(r.pull)}
                  </text>
                </g>
              );
            })}
            <text style={{ fontSize: svgPx(12) }} x={mid} y={H - 4} textAnchor="middle" className={axisText}>{`GPA ${f.gpa(semGpa)}`}</text>
          </svg>
          </PhoneMini>
        }
        rows={[
          { label: t("contribution.semGpa"), value: f.gpa(semGpa) },
          ...(top
            ? [
                { label: top.name, value: f.signed(top.pull), note: `(${f.gpa(top.points)} − ${f.gpa(semGpa)}) × ${f.num(top.credits)} ÷ ${f.num(d.last?.credits ?? 0)}` },
                { label: t("contribution.share"), value: `${f.num(top.share * 100, 1)}%`, note: `${f.num(top.credits)} ÷ ${f.num(d.last?.credits ?? 0)}` },
              ]
            : []),
          { label: t("contribution.sum"), value: f.signed(rows.reduce((s, r) => s + r.pull, 0)), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 3 · Grade distribution by credits (labeled bar chart) */
export function GpaDistributionCard({ state, d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const grades = d.scale.grades;
  const byLetter = grades.map((g) => ({ ...g, credits: 0, count: 0 }));
  state.semesters.forEach((s, si) =>
    s.courses.forEach((c, ci) => {
      const row = byLetter.find((b) => b.letter === courseLetter(state, c));
      const credits = d.terms[si][ci].credits;
      if (row && credits > 0) {
        row.credits += credits;
        row.count += 1;
      }
    }),
  );
  const total = byLetter.reduce((s, b) => s + b.credits, 0) || 1;
  const maxC = Math.max(1, ...byLetter.map((b) => b.credits));
  const [fitRef, W] = useFitWidth(400);
  const H = 210;
  const B = 34;
  const bw = (W - 20) / grades.length;
  const color = (p: number) => {
    const r = (p - d.scale.min) / (d.scale.max - d.scale.min);
    return r >= 0.85 ? "#10b981" : r >= 0.6 ? "#3b82f6" : r >= 0.35 ? "#f59e0b" : "#ef4444";
  };
  const topRow = [...byLetter].sort((a, b) => b.credits - a.credits)[0];

  return (
    <SectionCard title={t("distribution.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("distribution.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("distribution.title")} className="max-w-full">
            {byLetter.map((b, i) => {
              const h = (b.credits / maxC) * (H - B - 26);
              const cx = 10 + i * bw + bw / 2;
              return (
                <g key={b.letter}>
                  <rect x={cx - bw * 0.35} y={H - B - h} width={bw * 0.7} height={Math.max(h, 1)} rx={3} fill={color(b.points)} fillOpacity={b.credits ? 0.9 : 0.15} style={{ transition: "all 400ms ease" }} />
                  <text style={{ fontSize: svgPx(12) }} x={cx} y={H - B - h - 4} textAnchor="middle" fontWeight={700} className={valueText}>{b.credits ? f.num(b.credits) : "0"}</text>
                  <text style={{ fontSize: svgPx(12) }} x={cx} y={H - B + 14} textAnchor="middle" fontWeight={700} className={valueText}>{b.letter}</text>
                  <text style={{ fontSize: svgPx(12) }} x={cx} y={H - B + 27} textAnchor="middle" className={axisText}>{b.points.toFixed(2)}</text>
                </g>
              );
            })}
          </svg>
        }
        rows={[
          ...byLetter
            .filter((b) => b.credits > 0)
            .map((b) => ({ label: `${b.letter} (${b.points.toFixed(2)})`, value: `${f.num(b.credits)} · ${f.num((b.credits / total) * 100, 1)}%`, note: t("distribution.courses", { n: b.count }) })),
          { label: t("distribution.mode"), value: topRow.letter, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 4 · Target planner slider (interactive: required semester GPA vs planned credits) */
export function GpaTargetSliderCard({ state, setState, d, f }: IndicatorProps) {
  const t = useIndicatorT();
  const tp = useTranslations("tools.gpa-calculator.planner");
  const [fitRef, W] = useFitWidth(400);
  const H = 230;
  const L = 34;
  const R = 12;
  const T = 12;
  const B = 28;
  const xs = Array.from({ length: 22 }, (_, i) => i + 3);
  const lo = d.scale.min;
  const top = d.scale.max + (d.scale.max - lo) * 0.5;
  const req = (c: number) => planTarget(state.scale, d.cumulativeGpa, d.cumulativeCredits, d.target, c).required;
  const x = (c: number) => L + ((c - 3) / 21) * (W - L - R);
  const y = (v: number) => T + (1 - (Math.min(top, Math.max(lo, v)) - lo) / (top - lo)) * (H - T - B);
  const cur = Math.min(24, Math.max(3, Math.round(d.plannedCredits)));
  const verdict =
    d.plan.status === "impossible"
      ? d.plan.semestersAtMax === null
        ? tp("verdict.never")
        : tp("verdict.impossible", { n: d.plan.semestersAtMax })
      : d.plan.status === "guaranteed"
        ? tp("verdict.guaranteed")
        : tp("verdict.achievable", { gpa: f.gpa(d.plan.required) });
  const step = d.scale.max === 5 ? 0.05 : 0.01;

  return (
    <SectionCard title={t("target.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("target.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-[400px] max-w-full">
            <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("target.title")} className="max-w-full">
              <rect x={L} y={T} width={W - L - R} height={y(d.scale.max) - T} fill="#ef4444" fillOpacity={0.1} />
              <text style={{ fontSize: svgPx(12) }} x={W - R - 4} y={T + 12} textAnchor="end" fill="#dc2626">{t("target.impossibleZone")}</text>
              <line x1={L} x2={W - R} y1={y(d.scale.max)} y2={y(d.scale.max)} stroke="#dc2626" strokeWidth={1.5} />
              {[lo, d.scale.max].map((v) => (
                <text style={{ fontSize: svgPx(12) }} key={v} x={L - 4} y={y(v) + 3} textAnchor="end" className={axisText}>{v.toFixed(2)}</text>
              ))}
              <polyline points={xs.map((c) => `${x(c)},${y(req(c))}`).join(" ")} fill="none" stroke="#2563eb" strokeWidth={2.5} />
              {[3, 6, 9, 12, 15, 18, 21, 24].map((c) => (
                <text style={{ fontSize: svgPx(12) }} key={c} x={x(c)} y={H - 10} textAnchor="middle" className={axisText}>{c}</text>
              ))}
              <line x1={x(cur)} x2={x(cur)} y1={T} y2={H - B} stroke="currentColor" strokeOpacity={0.3} strokeDasharray="3 3" />
              <circle cx={x(cur)} cy={y(d.plan.required)} r={7} fill={d.plan.status === "impossible" ? "#dc2626" : "#10b981"} stroke="white" strokeWidth={2} style={{ transition: "all 250ms ease" }} />
              <text style={{ fontSize: svgPx(12) }} x={x(cur) + (cur > 18 ? -10 : 10)} y={y(d.plan.required) - 8} textAnchor={cur > 18 ? "end" : "start"} fontWeight={800} className={valueText}>
                {f.gpa(d.plan.required)}
              </text>
            </svg>
            <label className="mt-2 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              {tp("input.target")}: <span dir="ltr" className="font-mono text-blue-700 dark:text-blue-300">{f.gpa(d.target)}</span>
              <input
                type="range"
                min={lo}
                max={d.scale.max}
                step={step}
                value={d.target}
                onChange={(e) => setState({ ...state, target: e.target.value })}
                className="mt-1 w-full accent-blue-600"
              />
            </label>
            <label className="mt-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              {tp("input.plannedCredits")}: <span dir="ltr" className="font-mono text-blue-700 dark:text-blue-300">{f.num(cur)}</span>
              <input
                type="range"
                min={3}
                max={24}
                step={1}
                value={cur}
                onChange={(e) => setState({ ...state, plannedCredits: e.target.value })}
                className="mt-1 w-full accent-blue-600"
              />
            </label>
          </div>
        }
        rows={[
          { label: t("target.current"), value: f.gpa(d.cumulativeGpa), note: `${f.num(d.cumulativeQualityPoints)} ÷ ${f.num(d.cumulativeCredits)}` },
          { label: tp("result.target"), value: f.gpa(d.target) },
          {
            label: tp("result.required"),
            value: f.gpa(d.plan.required),
            note: `(${f.gpa(d.target)} × ${f.num(d.cumulativeCredits + d.plannedCredits)} − ${f.num(d.cumulativeQualityPoints)}) ÷ ${f.num(d.plannedCredits)}`,
          },
          { label: t("target.best"), value: f.gpa(d.plan.bestThisSemester), note: t("target.bestNote", { max: d.scale.max.toFixed(2) }) },
          { label: tp("result.verdict"), value: verdict, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}
