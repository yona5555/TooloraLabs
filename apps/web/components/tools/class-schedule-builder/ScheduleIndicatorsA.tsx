"use client";
import { DAY_CODES, findClassConflicts } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { classColor, fmt, hm, toMinutes, type Derived, type StudioState } from "./studio";
import { axisText, gridLine, hourWindow, useDayOrder, useSchedT, useUnits, valueText } from "./ScheduleShared";

export type SchedIndicatorProps = { state: StudioState; onChange: (s: StudioState) => void; d: Derived };

const BUFFER_STEPS = [0, 5, 10, 15, 20, 30];

/* 1 · Conflict & buffer map (interactive: drag the buffer slider, the flagged gaps update everywhere) */
export function ScheduleConflictCard({ state, onChange, d }: SchedIndicatorProps) {
  const t = useSchedT();
  const [h0, h1] = hourWindow(d);
  const days = d.shownDays;
  const W = 420;
  const LW = 34;
  const RH = 26;
  const TOP = 6;
  const H = TOP + days.length * RH + 24;
  const x = (min: number) => LW + ((min - h0 * 60) / ((h1 - h0) * 60)) * (W - LW - 6);
  const sens = BUFFER_STEPS.map((b) => ({ b, n: findClassConflicts(d.classes, { bufferMinutes: b }).filter((c) => c.kind === "buffer").length }));
  const tightest = d.stats.days
    .flatMap((s) => s.meetings.slice(1).map((m, i) => ({ day: s.day, gap: m.startMinutes - s.meetings[i].endMinutes })))
    .filter((g) => g.gap >= 0)
    .sort((a, b) => a.gap - b.gap)[0];

  return (
    <SectionCard title={t("ind.conflict.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.conflict.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <div className="w-[420px] max-w-full">
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.conflict.title")} className="max-w-full">
              <defs>
                <pattern id="csb-hatch-a" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="5" height="5" fill="#ef4444" fillOpacity="0.25" />
                  <line x1="0" y1="0" x2="0" y2="5" stroke="#dc2626" strokeWidth="2.2" />
                </pattern>
              </defs>
              {Array.from({ length: h1 - h0 + 1 }, (_, i) => h0 + i).map((h) => (
                <g key={h}>
                  <line x1={x(h * 60)} x2={x(h * 60)} y1={TOP} y2={TOP + days.length * RH} className={gridLine} />
                  {(h - h0) % 2 === 0 && (
                    <text x={x(h * 60)} y={TOP + days.length * RH + 12} textAnchor="middle" fontSize={9} className={axisText}>
                      {hm(h * 60)}
                    </text>
                  )}
                </g>
              ))}
              {days.map((day, ri) => {
                const y0 = TOP + ri * RH;
                const s = d.stats.days[DAY_CODES.indexOf(day)];
                return (
                  <g key={day}>
                    <text x={0} y={y0 + RH / 2 + 3} fontSize={10} fontWeight={700} className={s.classCount ? valueText : axisText}>
                      {t(`days.${day}`)}
                    </text>
                    {s.meetings.map((m) => {
                      const c = d.byId.get(m.id);
                      return (
                        <rect key={m.id} x={x(m.startMinutes)} y={y0 + 5} width={Math.max(2, x(m.endMinutes) - x(m.startMinutes))} height={RH - 10} rx={3} fill={c ? classColor(c) : "#64748b"} fillOpacity={0.8} />
                      );
                    })}
                    {d.overlaps
                      .filter((o) => o.day === day)
                      .map((o, i) => (
                        <rect key={`o${i}`} x={x(o.startMinutes)} y={y0 + 2} width={Math.max(2, x(o.endMinutes) - x(o.startMinutes))} height={RH - 4} fill="url(#csb-hatch-a)" stroke="#dc2626" rx={2} />
                      ))}
                    {d.tight
                      .filter((o) => o.day === day)
                      .map((o, i) => {
                        const cx = (x(o.startMinutes) + x(o.endMinutes)) / 2;
                        return (
                          <g key={`b${i}`} style={{ transition: "opacity 300ms ease" }}>
                            <rect x={cx - 3} y={y0 + 1} width={6} height={RH - 2} rx={2} fill="#f59e0b" />
                            <text x={cx} y={y0 + 1} dy={-1} textAnchor="middle" fontSize={8} fontWeight={800} fill="#d97706">
                              {`${fmt(o.gapMinutes)}′`}
                            </text>
                          </g>
                        );
                      })}
                  </g>
                );
              })}
            </svg>
            <label className="mt-2 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              {t("ind.conflict.buffer")}: <span dir="ltr" className="font-mono text-blue-700 dark:text-blue-300">{t("units.minutes", { n: fmt(state.buffer) })}</span>
              <input type="range" min={0} max={30} step={5} value={state.buffer} onChange={(e) => onChange({ ...state, buffer: Number(e.target.value) })} className="mt-1 w-full accent-blue-600" />
            </label>
          </div>
        }
        rows={[
          { label: t("ind.conflict.overlaps"), value: fmt(d.overlaps.length), note: d.overlaps.map((o) => t("result.overlapBy", { n: fmt(o.overlapMinutes) })).join(" · ") || undefined },
          { label: t("ind.conflict.tight", { buffer: fmt(state.buffer) }), value: fmt(d.tight.length), note: t("ind.conflict.rule") },
          ...sens.map((s) => ({ label: t("ind.conflict.atBuffer", { n: fmt(s.b) }), value: fmt(s.n) })),
          { label: t("ind.conflict.tightest"), value: tightest ? t("units.minutes", { n: fmt(tightest.gap) }) : "—", note: tightest ? t(`daysLong.${tightest.day}`) : undefined, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 2 · Daily load: class hours per day (labeled bar chart with the campus-day average) */
export function ScheduleDailyLoadCard({ d }: SchedIndicatorProps) {
  const t = useSchedT();
  const u = useUnits();
  const days = useDayOrder(d.shownDays);
  const W = 400;
  const H = 190;
  const B = 150;
  const max = Math.max(60, ...d.stats.days.map((s) => s.scheduledMinutes));
  const scale = (B - 24) / max;
  const bw = (W - 20) / days.length;
  const avg = d.stats.campusDays ? d.stats.totalMinutes / d.stats.campusDays : 0;

  return (
    <SectionCard title={t("ind.load.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.load.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.load.title")} className="max-w-full">
            <line x1={10} x2={W - 10} y1={B} y2={B} stroke="currentColor" strokeOpacity={0.35} />
            {days.map((day, i) => {
              const s = d.stats.days[DAY_CODES.indexOf(day)];
              const h = s.scheduledMinutes * scale;
              const x0 = 10 + i * bw + bw * 0.18;
              const busiest = day === d.stats.busiestDay;
              return (
                <g key={day}>
                  <rect x={x0} y={B - h} width={bw * 0.64} height={h} rx={5} fill={busiest ? "#2563eb" : "#60a5fa"} style={{ transition: "all 400ms ease" }} />
                  <text x={x0 + bw * 0.32} y={B - h - 5} textAnchor="middle" fontSize={11} fontWeight={800} className={valueText}>
                    {fmt(s.scheduledMinutes / 60, 1)}
                  </text>
                  <text x={x0 + bw * 0.32} y={B + 14} textAnchor="middle" fontSize={10} fontWeight={700} className={axisText}>
                    {t(`days.${day}`)}
                  </text>
                  <text x={x0 + bw * 0.32} y={B + 27} textAnchor="middle" fontSize={9} className={axisText}>
                    {s.classCount ? `×${fmt(s.classCount)}` : ""}
                  </text>
                </g>
              );
            })}
            {avg > 0 && (
              <g>
                <line x1={10} x2={W - 10} y1={B - avg * scale} y2={B - avg * scale} stroke="#f59e0b" strokeDasharray="5 4" strokeWidth={1.5} />
                <text x={W - 10} y={B - avg * scale - 4} textAnchor="end" fontSize={9} fontWeight={700} fill="#d97706">
                  {`${t("ind.load.avgShort")} ${fmt(avg / 60, 1)}`}
                </text>
              </g>
            )}
          </svg>
        }
        rows={[
          ...d.shownDays.map((day) => {
            const s = d.stats.days[DAY_CODES.indexOf(day)];
            return { label: t(`daysLong.${day}`), value: u.h(s.scheduledMinutes), note: s.classCount ? t("ind.load.classesN", { n: s.classCount }) : t("result.dayOff") };
          }),
          { label: t("ind.load.avg"), value: u.h(avg), note: `${u.h(d.stats.totalMinutes)} ÷ ${fmt(d.stats.campusDays)}` },
          { label: t("ind.load.busiest"), value: d.stats.busiestDay ? t(`daysLong.${d.stats.busiestDay}`) : "—", emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 3 · Free time between classes: class time vs gaps inside each campus day (stacked segmented bars) */
export function ScheduleGapsCard({ d }: SchedIndicatorProps) {
  const t = useSchedT();
  const u = useUnits();
  const campus = d.stats.days.filter((s) => s.classCount > 0);
  const W = 400;
  const LW = 34;
  const RH = 28;
  const H = campus.length * RH + 30;
  const maxSpan = Math.max(60, ...campus.map((s) => s.spanMinutes));
  const sx = (W - LW - 10) / maxSpan;
  const allGaps = campus.flatMap((s) => s.gaps);
  const study = allGaps.filter((g) => g.minutes >= 60);

  return (
    <SectionCard title={t("ind.gaps.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.gaps.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.gaps.title")} className="max-w-full">
            {campus.map((s, ri) => {
              const y0 = ri * RH + 4;
              const first = s.firstStart ?? 0;
              const segs: { a: number; b: number; gap: boolean }[] = [];
              let cur = first;
              for (const g of s.gaps) {
                segs.push({ a: cur, b: g.startMinutes, gap: false });
                segs.push({ a: g.startMinutes, b: g.endMinutes, gap: true });
                cur = g.endMinutes;
              }
              segs.push({ a: cur, b: s.lastEnd ?? cur, gap: false });
              return (
                <g key={s.day}>
                  <text x={0} y={y0 + RH / 2 + 2} fontSize={10} fontWeight={700} className={valueText}>
                    {t(`days.${s.day}`)}
                  </text>
                  {segs.map((g, i) => {
                    const w = (g.b - g.a) * sx;
                    const x0 = LW + (g.a - first) * sx;
                    const fill = !g.gap ? "#3b82f6" : g.b - g.a >= 60 ? "#10b981" : "#f59e0b";
                    return (
                      <g key={i}>
                        <rect x={x0} y={y0} width={Math.max(1, w - 1)} height={RH - 8} rx={4} fill={fill} fillOpacity={g.gap ? 0.85 : 1} style={{ transition: "all 400ms ease" }} />
                        {w > 26 && (
                          <text x={x0 + w / 2} y={y0 + (RH - 8) / 2 + 3.5} textAnchor="middle" fontSize={9} fontWeight={800} fill="white">
                            {fmt((g.b - g.a) / 60, 1)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
            {[
              { c: "#3b82f6", k: t("ind.gaps.inClass") },
              { c: "#f59e0b", k: t("ind.gaps.short") },
              { c: "#10b981", k: t("ind.gaps.study") },
            ].map((l, i) => (
              <g key={l.k} transform={`translate(${LW + i * 120}, ${H - 14})`}>
                <rect width={10} height={10} rx={2} fill={l.c} />
                <text x={14} y={9} fontSize={9} className={axisText}>
                  {l.k}
                </text>
              </g>
            ))}
          </svg>
        }
        rows={[
          ...campus.map((s) => ({
            label: t(`daysLong.${s.day}`),
            value: u.dur(s.gapMinutes),
            note: s.gaps.length ? s.gaps.map((g) => `${hm(g.startMinutes)}–${hm(g.endMinutes)}`).join(", ") : t("ind.gaps.none"),
          })),
          { label: t("ind.gaps.longest"), value: d.stats.longestGap ? u.dur(d.stats.longestGap.minutes) : "—", note: d.stats.longestGap ? t(`daysLong.${d.stats.longestGap.day}`) : undefined },
          { label: t("ind.gaps.studyWindows"), value: fmt(study.length), note: u.h(study.reduce((a, g) => a + g.minutes, 0)) },
          { label: t("ind.gaps.total"), value: u.h(d.stats.totalGapMinutes), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 4 · Credits vs weekly contact hours per class (paired bars; labs meet more hours per credit) */
export function ScheduleCreditsCard({ state }: SchedIndicatorProps) {
  const t = useSchedT();
  const u = useUnits();
  const rows = state.classes.map((c) => ({ c, credits: c.credits, contact: (Math.max(0, toMinutes(c.end) - toMinutes(c.start)) * c.days.length) / 60 }));
  const W = 400;
  const LW = 70;
  const RH = 26;
  const H = rows.length * RH + 26;
  const max = Math.max(1, ...rows.map((r) => Math.max(r.credits, r.contact)));
  const sx = (W - LW - 36) / max;
  const totC = rows.reduce((a, r) => a + r.credits, 0);
  const totH = rows.reduce((a, r) => a + r.contact, 0);

  return (
    <SectionCard title={t("ind.credits.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.credits.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.credits.title")} className="max-w-full">
            {rows.map((r, i) => {
              const y0 = i * RH + 2;
              return (
                <g key={r.c.id}>
                  <rect x={0} y={y0 + 4} width={8} height={RH - 10} rx={2} fill={classColor(r.c)} />
                  <text x={12} y={y0 + RH / 2 + 2} fontSize={9.5} fontWeight={700} className={valueText}>
                    {(r.c.code || r.c.name).slice(0, 10)}
                  </text>
                  <rect x={LW} y={y0 + 2} width={Math.max(1, r.credits * sx)} height={9} rx={3} fill="#8b5cf6" style={{ transition: "all 400ms ease" }} />
                  <text x={LW + r.credits * sx + 4} y={y0 + 10} fontSize={8.5} fontWeight={700} fill="#7c3aed">
                    {fmt(r.credits)}
                  </text>
                  <rect x={LW} y={y0 + 13} width={Math.max(1, r.contact * sx)} height={9} rx={3} fill="#0ea5e9" style={{ transition: "all 400ms ease" }} />
                  <text x={LW + r.contact * sx + 4} y={y0 + 21} fontSize={8.5} fontWeight={700} fill="#0284c7">
                    {fmt(r.contact, 1)}
                  </text>
                </g>
              );
            })}
            {[
              { c: "#8b5cf6", k: t("ind.credits.credits") },
              { c: "#0ea5e9", k: t("ind.credits.contact") },
            ].map((l, i) => (
              <g key={l.k} transform={`translate(${LW + i * 150}, ${H - 13})`}>
                <rect width={10} height={10} rx={2} fill={l.c} />
                <text x={14} y={9} fontSize={9} className={axisText}>
                  {l.k}
                </text>
              </g>
            ))}
          </svg>
        }
        rows={[
          ...rows.map((r) => ({
            label: r.c.code || r.c.name || t("input.untitled"),
            value: r.credits ? t("units.perCredit", { n: fmt(r.contact / r.credits, 2) }) : "—",
            note: `${u.h(r.contact * 60, 2)} ÷ ${fmt(r.credits)} · ${t(`kinds.${r.c.kind}`)}`,
          })),
          { label: t("ind.credits.overall"), value: totC ? t("units.perCredit", { n: fmt(totH / totC, 2) }) : "—", note: `${u.h(totH * 60)} ÷ ${fmt(totC)}`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}
