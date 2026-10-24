"use client";
import { useState, useId } from "react";
import { Minus, Plus } from "lucide-react";
import { DAY_CODES, termOccurrences, weeklyScheduleStats } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { classColor, fmt, hm } from "./studio";
import { axisText, gridLine, hourWindow, useDayOrder, useSchedT, useUnits, valueText } from "./ScheduleShared";
import type { SchedIndicatorProps } from "./ScheduleIndicatorsA";

const stepBtn =
  "flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800";

/* 5 · Day window: first start to last end per day, earliest and latest marked (floating range bars) */
export function ScheduleWindowCard({ d }: SchedIndicatorProps) {
  const t = useSchedT();
  const u = useUnits();
  const days = useDayOrder(d.shownDays);
  const [h0, h1] = hourWindow(d);
  const W = 400;
  const AX = 38;
  const TOP = 20;
  const H = 210;
  const y = (min: number) => TOP + ((min - h0 * 60) / ((h1 - h0) * 60)) * (H - TOP - 10);
  const cw = (W - AX) / days.length;

  return (
    <SectionCard title={t("ind.window.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.window.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.window.title")} className="max-w-full">
            {Array.from({ length: h1 - h0 + 1 }, (_, i) => h0 + i)
              .filter((h) => (h - h0) % 2 === 0)
              .map((h) => (
                <g key={h}>
                  <line x1={AX} x2={W} y1={y(h * 60)} y2={y(h * 60)} className={gridLine} />
                  <text x={AX - 4} y={y(h * 60) + 3} textAnchor="end" fontSize={9} className={axisText}>
                    {hm(h * 60)}
                  </text>
                </g>
              ))}
            {days.map((day, i) => {
              const s = d.stats.days[DAY_CODES.indexOf(day)];
              const cx = AX + i * cw + cw / 2;
              const early = s.firstStart !== null && s.firstStart === d.stats.earliestStart;
              const late = s.lastEnd !== null && s.lastEnd === d.stats.latestEnd;
              return (
                <g key={day}>
                  <text x={cx} y={12} textAnchor="middle" fontSize={10} fontWeight={700} className={s.classCount ? valueText : axisText}>
                    {t(`days.${day}`)}
                  </text>
                  {s.firstStart !== null && s.lastEnd !== null && (
                    <g style={{ transition: "all 400ms ease" }}>
                      <rect x={cx - 12} y={y(s.firstStart)} width={24} height={Math.max(3, y(s.lastEnd) - y(s.firstStart))} rx={8} fill="#6366f1" fillOpacity={0.22} stroke="#6366f1" />
                      {s.meetings.map((m) => (
                        <rect key={m.id} x={cx - 7} y={y(m.startMinutes)} width={14} height={Math.max(2, y(m.endMinutes) - y(m.startMinutes))} rx={2} fill="#4f46e5" />
                      ))}
                      <circle cx={cx} cy={y(s.firstStart)} r={5} fill={early ? "#10b981" : "#a5b4fc"} stroke="white" strokeWidth={1.5} />
                      <circle cx={cx} cy={y(s.lastEnd)} r={5} fill={late ? "#ef4444" : "#a5b4fc"} stroke="white" strokeWidth={1.5} />
                      {early && (
                        <text x={cx} y={y(s.firstStart) - 8} textAnchor="middle" fontSize={9} fontWeight={800} fill="#059669">
                          {hm(s.firstStart)}
                        </text>
                      )}
                      {late && (
                        <text x={cx} y={y(s.lastEnd) + 16} textAnchor="middle" fontSize={9} fontWeight={800} fill="#dc2626">
                          {hm(s.lastEnd)}
                        </text>
                      )}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        }
        rows={[
          ...d.shownDays
            .map((day) => d.stats.days[DAY_CODES.indexOf(day)])
            .filter((s) => s.classCount)
            .map((s) => ({ label: t(`daysLong.${s.day}`), value: `${hm(s.firstStart ?? 0)}–${hm(s.lastEnd ?? 0)}`, note: u.h(s.spanMinutes) })),
          { label: t("result.earliest"), value: d.stats.earliestStart === null ? "—" : hm(d.stats.earliestStart), note: d.stats.earliestDay ? t(`daysLong.${d.stats.earliestDay}`) : undefined },
          { label: t("result.latest"), value: d.stats.latestEnd === null ? "—" : hm(d.stats.latestEnd), note: d.stats.latestDay ? t(`daysLong.${d.stats.latestDay}`) : undefined },
          { label: t("result.avgDay"), value: u.h(d.stats.averageCampusDayMinutes), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 6 · Campus days and commute (interactive: − / + commute minutes per round trip) */
export function ScheduleCampusCard({ state, onChange, d }: SchedIndicatorProps) {
  const t = useSchedT();
  const u = useUnits();
  const days = useDayOrder(DAY_CODES);
  const campusDays = d.stats.days.filter((s) => s.classCount > 0).map((s) => s.day);
  const termTrips = termOccurrences({ days: campusDays }, state.termStart, state.termEnd, d.exclude).length;
  const weekly = campusDays.length * state.commute;
  const maxLoad = Math.max(1, ...d.stats.days.map((s) => s.scheduledMinutes));
  const W = 400;
  const H = 130;
  const tw = W / 7;
  const setCommute = (v: number) => onChange({ ...state, commute: Math.max(0, Math.min(180, v)) });

  return (
    <SectionCard title={t("ind.campus.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.campus.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <div className="w-[400px] max-w-full">
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.campus.title")} className="max-w-full">
              {days.map((day, i) => {
                const s = d.stats.days[DAY_CODES.indexOf(day)];
                const on = s.classCount > 0;
                const cx = i * tw + tw / 2;
                const fill = s.scheduledMinutes / maxLoad;
                return (
                  <g key={day}>
                    <rect x={i * tw + 4} y={6} width={tw - 8} height={70} rx={10} className={on ? "fill-blue-50 dark:fill-blue-500/10" : "fill-zinc-100 dark:fill-zinc-800"} stroke={on ? "#2563eb" : "none"} />
                    {on && <rect x={i * tw + 4} y={6 + 70 * (1 - fill)} width={tw - 8} height={70 * fill} rx={10} fill="#2563eb" fillOpacity={0.35} style={{ transition: "all 400ms ease" }} />}
                    <text x={cx} y={30} textAnchor="middle" fontSize={11} fontWeight={800} className={on ? valueText : axisText}>
                      {t(`days.${day}`)}
                    </text>
                    <circle cx={cx} cy={45} r={7} fill={on ? "#2563eb" : "none"} stroke={on ? "#2563eb" : "currentColor"} strokeOpacity={on ? 1 : 0.35} strokeDasharray={on ? undefined : "3 2"} />
                    <text x={cx} y={68} textAnchor="middle" fontSize={9} fontWeight={700} className={axisText}>
                      {on ? fmt(s.scheduledMinutes / 60, 1) : "—"}
                    </text>
                    {on && state.commute > 0 && (
                      <text x={cx} y={94} textAnchor="middle" fontSize={9} fontWeight={700} fill="#d97706">
                        {`+${fmt(state.commute)}′`}
                      </text>
                    )}
                  </g>
                );
              })}
              <text x={W / 2} y={120} textAnchor="middle" fontSize={11} fontWeight={800} className={valueText}>
                {`${fmt(campusDays.length)}/7 · ${u.h(weekly)}`}
              </text>
            </svg>
            <div className="mt-1 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              <span>{t("ind.campus.commute")}</span>
              <button type="button" className={stepBtn} aria-label={t("input.less")} disabled={state.commute <= 0} onClick={() => setCommute(state.commute - 5)}>
                <Minus size={13} />
              </button>
              <span dir="ltr" className="w-16 text-center font-mono text-sm font-bold text-blue-700 dark:text-blue-300">
                {t("units.minutes", { n: fmt(state.commute) })}
              </span>
              <button type="button" className={stepBtn} aria-label={t("input.more")} disabled={state.commute >= 180} onClick={() => setCommute(state.commute + 5)}>
                <Plus size={13} />
              </button>
            </div>
          </div>
        }
        rows={[
          { label: t("ind.campus.campusDays"), value: `${fmt(campusDays.length)}/7`, note: campusDays.map((x) => t(`days.${x}`)).join(" ") },
          { label: t("ind.campus.offDays"), value: fmt(7 - campusDays.length) },
          { label: t("ind.campus.perWeek"), value: u.h(weekly), note: `${fmt(campusDays.length)} × ${t("units.minutes", { n: fmt(state.commute) })}` },
          { label: t("ind.campus.trips"), value: fmt(termTrips), note: t("ind.campus.tripsNote") },
          { label: t("ind.campus.perTerm"), value: u.h(termTrips * state.commute, 0), note: `${fmt(termTrips)} × ${t("units.minutes", { n: fmt(state.commute) })}`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

const STREAK_STEPS = [0, 10, 15, 30];

/* 7 · Back-to-back streaks (interactive: choose what gap still counts as "back to back") */
export function ScheduleStreakCard({ d }: SchedIndicatorProps) {
  const t = useSchedT();
  const u = useUnits();
  const [gap, setGap] = useState(15);
  const stats = weeklyScheduleStats(d.classes, { streakGapMinutes: gap });
  const days = useDayOrder(d.shownDays);
  const W = 400;
  const H = 190;
  const B = 150;
  const maxN = Math.max(3, ...stats.days.map((s) => s.longestStreak));
  const bh = (B - 20) / maxN;
  const bw = W / days.length;
  const best = stats.longestStreak;

  return (
    <SectionCard title={t("ind.streak.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.streak.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <div className="w-[400px] max-w-full">
            <div className="mb-2 flex flex-wrap items-center gap-1 text-xs">
              <span className="font-semibold text-zinc-600 dark:text-zinc-300">{t("ind.streak.gapLabel")}</span>
              {STREAK_STEPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={gap === g}
                  onClick={() => setGap(g)}
                  className={`rounded-full px-2.5 py-0.5 font-bold transition ${gap === g ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"}`}
                >
                  {`≤ ${t("units.minutes", { n: fmt(g) })}`}
                </button>
              ))}
            </div>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.streak.title")} className="max-w-full">
              <line x1={0} x2={W} y1={B} y2={B} stroke="currentColor" strokeOpacity={0.35} />
              {days.map((day, i) => {
                const s = stats.days[DAY_CODES.indexOf(day)];
                const r = s.longestStreakRange;
                const chain = r ? s.meetings.filter((m) => m.startMinutes >= r.startMinutes && m.endMinutes <= r.endMinutes).slice(0, s.longestStreak) : [];
                const x0 = i * bw + bw * 0.2;
                const isBest = !!best && best.day === day && s.longestStreak > 1;
                return (
                  <g key={day}>
                    {chain.map((m, k) => {
                      const c = d.byId.get(m.id);
                      return (
                        <rect key={m.id} x={x0} y={B - (k + 1) * bh + 2} width={bw * 0.6} height={bh - 4} rx={4} fill={c ? classColor(c) : "#64748b"} style={{ transition: "all 400ms ease" }} />
                      );
                    })}
                    {isBest && <rect x={x0 - 3} y={B - chain.length * bh - 1} width={bw * 0.6 + 6} height={chain.length * bh + 1} rx={6} fill="none" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 3" />}
                    <text x={x0 + bw * 0.3} y={B - chain.length * bh - 6} textAnchor="middle" fontSize={11} fontWeight={800} className={valueText}>
                      {s.longestStreak ? `×${fmt(s.longestStreak)}` : ""}
                    </text>
                    <text x={x0 + bw * 0.3} y={B + 14} textAnchor="middle" fontSize={10} fontWeight={700} className={axisText}>
                      {t(`days.${day}`)}
                    </text>
                    <text x={x0 + bw * 0.3} y={B + 27} textAnchor="middle" fontSize={9} className={axisText}>
                      {r && s.longestStreak > 1 ? u.h(r.minutes) : ""}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        }
        rows={[
          ...d.shownDays
            .map((day) => stats.days[DAY_CODES.indexOf(day)])
            .filter((s) => s.classCount)
            .map((s) => ({
              label: t(`daysLong.${s.day}`),
              value: t("ind.streak.classesN", { n: s.longestStreak }),
              note: s.longestStreakRange ? `${hm(s.longestStreakRange.startMinutes)}–${hm(s.longestStreakRange.endMinutes)} · ${u.dur(s.longestStreakRange.minutes)}` : undefined,
            })),
          {
            label: t("ind.streak.longest"),
            value: best ? t("ind.streak.classesN", { n: best.count }) : "—",
            note: best ? `${t(`daysLong.${best.day}`)} · ${u.dur(best.range.minutes)}` : undefined,
            emphasize: true,
          },
        ]}
      />
    </SectionCard>
  );
}

/* 8 · Weekly workload gauge: contact hours + study time (h per credit) + commute (gradient gauge) */
export function ScheduleWorkloadCard({ state, d }: SchedIndicatorProps) {
  const svgId = useId();
  const t = useSchedT();
  const u = useUnits();
  const [ratio, setRatio] = useState(2);
  const contact = d.stats.totalMinutes / 60;
  const study = d.stats.totalCredits * ratio;
  const commute = (d.stats.campusDays * state.commute) / 60;
  const total = contact + study + commute;
  const MAX = 70;
  const W = 260;
  const H = 168;
  const CX = W / 2;
  const CY = 136;
  const R = 100;
  const f = Math.min(1, total / MAX);
  const pt = (q: number, r: number) => [CX - r * Math.cos(q * Math.PI), CY - r * Math.sin(q * Math.PI)] as const;
  const [ex, ey] = pt(f, R);
  const zone = total < 30 ? "light" : total < 45 ? "balanced" : total < 55 ? "heavy" : "overload";
  const color = { light: "#0ea5e9", balanced: "#10b981", heavy: "#f59e0b", overload: "#ef4444" }[zone];

  return (
    <SectionCard title={t("ind.workload.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.workload.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <div className="w-[260px]">
            <PhoneMini slot={0} title={t("ind.workload.title")}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.workload.title")}>
              <defs>
                <linearGradient id={`${svgId}csb-workload`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="75%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} stroke={`url(#${svgId}csb-workload)`} strokeOpacity={0.25} strokeWidth={18} fill="none" />
              {f > 0 && <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${ex} ${ey}`} stroke={`url(#${svgId}csb-workload)`} strokeWidth={18} fill="none" strokeLinecap="round" />}
              {[0, 30, 45, 55, 70].map((v) => {
                const [tx, ty] = pt(v / MAX, R + 18);
                return (
                  <text key={v} x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize={9} className={axisText}>
                    {v}
                  </text>
                );
              })}
              <circle cx={ex} cy={ey} r={7} fill={color} stroke="white" strokeWidth={2} />
              <text x={CX} y={CY - 26} textAnchor="middle" fontSize={28} fontWeight={800} fill={color}>
                {fmt(total, 1)}
              </text>
              <text x={CX} y={CY - 8} textAnchor="middle" fontSize={10} className={axisText}>
                {`${fmt(contact, 1)} + ${fmt(study, 1)} + ${fmt(commute, 1)}`}
              </text>
              <text x={CX} y={CY + 22} textAnchor="middle" fontSize={11} fontWeight={800} fill={color}>
                {t(`ind.workload.zone.${zone}`)}
              </text>
            </svg>
            </PhoneMini>
            <div className="mt-1 flex items-center justify-center gap-1 text-xs">
              <span className="font-semibold text-zinc-600 dark:text-zinc-300">{t("ind.workload.ratio")}</span>
              {[1, 2, 3].map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={ratio === r}
                  onClick={() => setRatio(r)}
                  className={`rounded-full px-2.5 py-0.5 font-bold transition ${ratio === r ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"}`}
                >
                  {fmt(r)}
                </button>
              ))}
            </div>
          </div>
        }
        rows={[
          { label: t("ind.workload.contact"), value: u.h(contact * 60) },
          { label: t("ind.workload.study"), value: u.h(study * 60), note: `${fmt(d.stats.totalCredits)} × ${fmt(ratio)}` },
          { label: t("ind.workload.commute"), value: u.h(commute * 60), note: `${fmt(d.stats.campusDays)} × ${t("units.minutes", { n: fmt(state.commute) })}` },
          { label: t("ind.workload.total"), value: u.h(total * 60), emphasize: true },
          { label: t("ind.workload.perDay"), value: u.h((total * 60) / 7), note: t("ind.workload.vsWork", { n: fmt((total / 40) * 100) }) },
        ]}
      />
    </SectionCard>
  );
}
