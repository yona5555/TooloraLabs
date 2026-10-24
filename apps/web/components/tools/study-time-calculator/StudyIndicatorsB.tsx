"use client";
import { useMemo, useState } from "react";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { BREAK_COLORS, runPlan, useFmt, useStudyT } from "./studio";
import { axisText, upcomingExams, valueText, type StudyIndicatorProps } from "./StudyIndicatorsA";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";

/* 5 · Hours per exam: learning + reviews against the target, shortfall in red (ranked bars) */
export function HoursPerExamCard({ d }: StudyIndicatorProps) {
  const t = useStudyT();
  const f = useFmt();
  const exams = [...upcomingExams(d)].sort((a, b) => b.targetMinutes - a.targetMinutes);
  const max = Math.max(60, ...exams.map((e) => e.targetMinutes));
  const W = 400;
  const RH = 30;
  const L = 22;
  const H = exams.length * RH + 30;
  const sx = (m: number) => (m / max) * (W - L - 70);
  const tot = exams.reduce((a, e) => ({ p: a.p + e.plannedMinutes, g: a.g + e.targetMinutes }), { p: 0, g: 0 });

  return (
    <SectionCard title={t("ind.hours.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.hours.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <PhoneMini slot={0} title={t("ind.hours.title")}>
            <div className="w-[400px] max-w-full">
              <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.hours.title")} className="max-w-full">
                <defs>
                  <pattern id="study-hatch" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width={6} height={6} fill="#ef4444" fillOpacity={0.15} />
                    <line x1={0} y1={0} x2={0} y2={6} stroke="#ef4444" strokeWidth={2.5} />
                  </pattern>
                </defs>
                {exams.map((e, i) => {
                  const y = 4 + i * RH;
                  const c = d.colorOf(e.id);
                  const idx = upcomingExams(d).findIndex((x) => x.id === e.id);
                  return (
                    <g key={e.id}>
                      <circle cx={9} cy={y + 11} r={7} fill={c} />
                      <text x={9} y={y + 14.5} textAnchor="middle" fontSize={9} fontWeight={800} fill="white">
                        {idx + 1}
                      </text>
                      <rect x={L} y={y + 2} width={sx(e.targetMinutes)} height={18} rx={4} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeDasharray="3 2" />
                      <rect x={L} y={y + 2} width={sx(e.learnMinutes)} height={18} rx={4} fill={c} style={{ transition: "width 400ms ease" }} />
                      <rect x={L + sx(e.learnMinutes)} y={y + 2} width={sx(e.reviewMinutes)} height={18} fill={c} fillOpacity={0.45} style={{ transition: "all 400ms ease" }} />
                      {e.shortfallMinutes > 0 && <rect x={L + sx(e.plannedMinutes)} y={y + 2} width={sx(e.shortfallMinutes)} height={18} fill="url(#study-hatch)" />}
                      <text x={L + sx(e.targetMinutes) + 5} y={y + 15} fontSize={10.5} fontWeight={700} className={valueText}>
                        {`${f.n(e.plannedMinutes / 60, 1)}/${f.n(e.targetMinutes / 60, 1)}`}
                      </text>
                    </g>
                  );
                })}
                {[
                  { k: "learn", fill: "#2563eb", o: 1 },
                  { k: "review", fill: "#2563eb", o: 0.45 },
                  { k: "missing", fill: "url(#study-hatch)", o: 1 },
                ].map((lg, i) => (
                  <g key={lg.k} transform={`translate(${L + i * 110}, ${H - 18})`}>
                    <rect width={12} height={12} rx={2} fill={lg.fill} fillOpacity={lg.o} />
                    <text x={16} y={10} fontSize={10} fontWeight={600} className={valueText}>
                      {t(`ind.hours.${lg.k}`)}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </PhoneMini>
        }
        rows={[
          ...exams.map((e) => ({
            label: d.nameOf(e.id),
            value: `${f.n(e.plannedMinutes / 60, 2)} / ${f.h(e.targetMinutes)}`,
            note: `${f.pct(e.coverage)} · ${t("ind.hours.topics", { n: e.topicsCovered, total: e.topics })}`,
          })),
          { label: t("ind.hours.total"), value: `${f.n(tot.p / 60, 2)} / ${f.h(tot.g)}`, note: f.pct(tot.g ? tot.p / tot.g : 1, 1), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 6 · Daily load vs capacity (stacked columns per exam, capacity cap per day) */
export function DailyLoadCard({ d }: StudyIndicatorProps) {
  const t = useStudyT();
  const f = useFmt();
  const days = d.plan.days;
  const exams = upcomingExams(d);
  const n = Math.max(1, days.length);
  const W = 400;
  const H = 180;
  const L = 28;
  const B = 150;
  const maxM = Math.max(60, ...days.map((x) => Math.max(x.capacityMinutes, x.usedMinutes)));
  const top = Math.ceil(maxM / 60) * 60;
  const cw = (W - L - 4) / n;
  const y = (m: number) => B - (m / top) * (B - 10);
  const study = days.filter((x) => x.usedMinutes > 0);
  const full = days.filter((x) => x.usableMinutes > 0 && x.freeMinutes === 0).length;
  const spare = days.filter((x) => x.freeMinutes > 0).length;
  const usable = days.reduce((a, x) => a + x.usableMinutes, 0);
  const used = days.reduce((a, x) => a + x.usedMinutes, 0);
  const peak = d.plan.totals.peakDay >= 0 ? days[d.plan.totals.peakDay] : null;
  const step = Math.ceil(n / 9);

  return (
    <SectionCard title={t("ind.load.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.load.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.load.title")} className="max-w-full">
            {Array.from({ length: top / 60 + 1 }, (_, i) => i * 60).map((m) => (
              <g key={m}>
                <line x1={L} x2={W - 4} y1={y(m)} y2={y(m)} stroke="currentColor" strokeOpacity={0.1} />
                <text x={L - 4} y={y(m) + 3} textAnchor="end" fontSize={9} className={axisText}>
                  {`${m / 60}${t("units.h")}`}
                </text>
              </g>
            ))}
            {days.map((day) => {
              const x0 = L + day.index * cw;
              let acc = 0;
              return (
                <g key={day.index}>
                  {day.capacityMinutes > 0 && (
                    <rect x={x0 + 1} y={y(day.capacityMinutes)} width={Math.max(1, cw - 2)} height={B - y(day.capacityMinutes)} rx={2} fill="currentColor" fillOpacity={day.usableMinutes ? 0.08 : 0.03} />
                  )}
                  {exams.map((e) => {
                    const m = day.sessions.filter((s) => s.examId === e.id).reduce((a, s) => a + s.minutes, 0);
                    if (!m) return null;
                    const y1 = y(acc + m);
                    const y0 = y(acc);
                    acc += m;
                    return <rect key={e.id} x={x0 + 1} y={y1} width={Math.max(1, cw - 2)} height={y0 - y1} fill={d.colorOf(e.id)} style={{ transition: "all 400ms ease" }} />;
                  })}
                  {day.capacityMinutes > 0 && <line x1={x0 + 1} x2={x0 + cw - 1} y1={y(day.capacityMinutes)} y2={y(day.capacityMinutes)} stroke="#ef4444" strokeWidth={1.5} />}
                  {day.examIds.length > 0 && (
                    <text x={x0 + cw / 2} y={y(day.capacityMinutes) - 3} textAnchor="middle" fontSize={11} fill={d.colorOf(day.examIds[0])}>
                      ★
                    </text>
                  )}
                  {day.index % step === 0 && (
                    <text x={x0 + cw / 2} y={B + 13} textAnchor="middle" fontSize={9} className={axisText}>
                      {Number(day.date.slice(8))}
                    </text>
                  )}
                </g>
              );
            })}
            <line x1={L} x2={W - 4} y1={B} y2={B} stroke="currentColor" strokeOpacity={0.35} />
            <g transform={`translate(${L}, ${H - 10})`}>
              <line x1={0} x2={14} y1={-3} y2={-3} stroke="#ef4444" strokeWidth={1.5} />
              <text x={18} y={0} fontSize={9.5} fontWeight={600} className={valueText}>
                {t("ind.load.capacity")}
              </text>
            </g>
          </svg>
        }
        rows={[
          { label: t("ind.load.peak"), value: peak ? f.h(peak.usedMinutes) : "—", note: peak ? f.day(peak.date) : undefined },
          { label: t("ind.load.average"), value: f.h(study.length ? used / study.length : 0) },
          { label: t("ind.load.full"), value: `${f.n(full)} / ${f.n(days.filter((x) => x.usableMinutes > 0).length)}` },
          { label: t("ind.load.spare"), value: f.n(spare) },
          { label: t("ind.load.utilization"), value: f.pct(usable ? used / usable : 0, 1), note: `${f.n(used / 60, 2)} ÷ ${f.n(usable / 60, 2)}`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 7 · Buffer / shortfall balance with a what-if slider for extra hours per day */
export function SlackBalanceCard({ state, d }: StudyIndicatorProps) {
  const t = useStudyT();
  const f = useFmt();
  const [extra, setExtra] = useState(0);
  const what = useMemo(() => (extra === 0 ? d.plan : runPlan(state, extra)), [extra, state, d.plan]);
  const tot = what.totals;
  const need = tot.requiredMinutes;
  const cap = tot.capacityMinutes;
  const diff = cap - need;
  const span = Math.max(60, need, cap);
  const angle = Math.max(-14, Math.min(14, (diff / span) * 28));
  const W = 360;
  const H = 190;
  const CX = W / 2;
  const PY = 70;
  const arm = 130;
  const rad = (angle * Math.PI) / 180;
  // Positive angle: capacity side (right) heavier → right pan lower.
  const lx = CX - arm * Math.cos(rad);
  const ly = PY - arm * Math.sin(rad);
  const rx = CX + arm * Math.cos(rad);
  const ry = PY + arm * Math.sin(rad);
  const verdict = tot.shortfallMinutes > 0 ? "heavy" : diff > need * 0.15 ? "light" : "balanced";
  const vColor = verdict === "heavy" ? "#ef4444" : verdict === "light" ? "#10b981" : "#2563eb";
  const pan = (px: number, py: number, label: string, v: number, color: string) => (
    <g style={{ transition: "all 400ms ease" }}>
      <line x1={px} x2={px - 30} y1={py} y2={py + 34} stroke="currentColor" strokeOpacity={0.4} />
      <line x1={px} x2={px + 30} y1={py} y2={py + 34} stroke="currentColor" strokeOpacity={0.4} />
      <path d={`M ${px - 38} ${py + 34} Q ${px} ${py + 58} ${px + 38} ${py + 34} Z`} fill={color} fillOpacity={0.85} />
      <text x={px} y={py + 47} textAnchor="middle" fontSize={11} fontWeight={800} fill="white">
        {f.h(v, 1)}
      </text>
      <text x={px} y={py + 74} textAnchor="middle" fontSize={10} fontWeight={700} className={valueText}>
        {label}
      </text>
    </g>
  );

  return (
    <SectionCard title={t("ind.slack.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.slack.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <div className="w-[360px] max-w-full">
            <label className="mb-2 block text-xs">
              <span className="flex justify-between font-semibold text-zinc-600 dark:text-zinc-300">
                <span>{t("ind.slack.extra")}</span>
                <span dir="ltr" className="font-mono text-blue-700 dark:text-blue-300">{`${extra > 0 ? "+" : ""}${f.n(extra, 1)} ${t("units.h")}`}</span>
              </span>
              <input type="range" min={-2} max={3} step={0.5} value={extra} onChange={(e) => setExtra(Number(e.target.value))} className="w-full accent-blue-600" aria-label={t("ind.slack.extra")} />
            </label>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.slack.title")} className="max-w-full">
              <path d={`M ${CX - 26} ${H - 6} L ${CX + 26} ${H - 6} L ${CX} ${PY + 6} Z`} fill="currentColor" fillOpacity={0.15} />
              <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="currentColor" strokeOpacity={0.6} strokeWidth={4} strokeLinecap="round" style={{ transition: "all 400ms ease" }} />
              <circle cx={CX} cy={PY} r={6} fill={vColor} />
              {pan(lx, ly, t("ind.slack.needed"), need, "#8b5cf6")}
              {pan(rx, ry, t("ind.slack.capacity"), cap, "#2563eb")}
              <text x={CX} y={20} textAnchor="middle" fontSize={13} fontWeight={800} fill={vColor}>
                {`${t(`ind.slack.${verdict}`)} · ${diff >= 0 ? "+" : "−"}${f.h(Math.abs(diff), 1)}`}
              </text>
            </svg>
          </div>
        }
        rows={[
          { label: t("ind.slack.capacityNow"), value: f.h(d.plan.totals.capacityMinutes) },
          { label: t("ind.slack.capacityWhatIf"), value: f.h(cap), note: `${extra >= 0 ? "+" : "−"}${f.n(Math.abs(extra), 1)} × ${f.n(tot.horizonDays)}` },
          { label: t("ind.slack.needed"), value: f.h(need) },
          { label: t("ind.slack.buffer"), value: f.h(tot.freeMinutes) },
          { label: t("ind.slack.shortfall"), value: f.h(tot.shortfallMinutes), emphasize: tot.shortfallMinutes > 0 },
          { label: t("ind.slack.load"), value: Number.isFinite(tot.loadRatio) ? f.pct(tot.loadRatio) : "∞", emphasize: tot.shortfallMinutes === 0 },
        ]}
      />
    </SectionCard>
  );
}

/* 8 · Focus-to-break ratio of the whole plan (donut of desk time) */
export function FocusRatioCard({ d }: StudyIndicatorProps) {
  const t = useStudyT();
  const f = useFmt();
  const pt = d.pomodoroTotals;
  const wall = pt.wall || 1;
  const parts = [
    { k: "focus", v: pt.focus, c: BREAK_COLORS.work },
    { k: "short", v: pt.shortMinutes, c: BREAK_COLORS.short },
    { k: "long", v: pt.longMinutes, c: BREAK_COLORS.long },
  ];
  const S = 190;
  const C = S / 2;
  const R = 72;
  let a0 = -Math.PI / 2;
  const arcs = parts.map((p) => {
    const sweep = (p.v / wall) * Math.PI * 2;
    const a1 = a0 + sweep;
    const pnt = (a: number) => `${C + R * Math.cos(a)} ${C + R * Math.sin(a)}`;
    const d0 = p.v >= wall ? `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C - 0.01} ${C - R}` : `M ${pnt(a0)} A ${R} ${R} 0 ${sweep > Math.PI ? 1 : 0} 1 ${pnt(a1)}`;
    const mid = a0 + sweep / 2;
    a0 = a1;
    return { ...p, d: d0, mid, sweep };
  });
  const ratio = pt.wall ? pt.focus / pt.wall : 0;

  return (
    <SectionCard title={t("ind.ratio.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.ratio.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <PhoneMini slot={1} title={t("ind.ratio.title")}>
            <div className="flex items-center gap-4">
              <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} role="img" aria-label={t("ind.ratio.title")}>
                <circle cx={C} cy={C} r={R} fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={26} />
                {arcs.map((a) =>
                  a.v > 0 ? (
                    <g key={a.k}>
                      <path d={a.d} fill="none" stroke={a.c} strokeWidth={26} style={{ transition: "all 400ms ease" }} />
                      {a.sweep > 0.35 && (
                        <text x={C + R * Math.cos(a.mid)} y={C + R * Math.sin(a.mid) + 4} textAnchor="middle" fontSize={10} fontWeight={800} fill="white">
                          {f.pct(a.v / wall)}
                        </text>
                      )}
                    </g>
                  ) : null,
                )}
                <text x={C} y={C + 4} textAnchor="middle" fontSize={24} fontWeight={800} className={valueText}>
                  {f.pct(ratio)}
                </text>
                <text x={C} y={C + 20} textAnchor="middle" fontSize={9} className={axisText}>
                  {t("ind.ratio.focus")}
                </text>
              </svg>
              <ul className="space-y-1 text-xs">
                {parts.map((p) => (
                  <li key={p.k} className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: p.c }} />
                    <span className="text-zinc-600 dark:text-zinc-300">{t(`ind.ratio.${p.k}`)}</span>
                    <span dir="ltr" className="font-mono font-bold text-zinc-800 dark:text-zinc-100">
                      {f.h(p.v, 1)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </PhoneMini>
        }
        rows={[
          { label: t("ind.ratio.focus"), value: f.h(pt.focus), note: t("ind.ratio.pomodoros", { n: pt.pomodoros }) },
          { label: t("ind.ratio.short"), value: f.h(pt.shortMinutes), note: `${f.n(pt.short)} × ${f.n(d.pomodoroTotals.short ? pt.shortMinutes / pt.short : 0)}` },
          { label: t("ind.ratio.long"), value: f.h(pt.longMinutes), note: `${f.n(pt.long)} × ${f.n(d.pomodoroTotals.long ? pt.longMinutes / pt.long : 0)}` },
          { label: t("ind.ratio.wall"), value: f.h(pt.wall) },
          { label: t("ind.ratio.perHour"), value: f.min(ratio * 60) },
          { label: t("ind.ratio.ratio"), value: f.pct(ratio, 1), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}
