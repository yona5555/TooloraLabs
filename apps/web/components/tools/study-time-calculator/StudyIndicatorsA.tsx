"use client";
import { useState } from "react";
import { pomodoroForFocus, retentionCurve, sanitizePomodoro, type PomodoroSettings } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { BREAK_COLORS, useFmt, useStudyT, type Derived, type StudioState } from "./studio";
import { svgPx } from "@/components/tool-ui/svgPx";
import { useFitWidth } from "@/components/tool-ui/useFitWidth";

export type StudyIndicatorProps = { state: StudioState; setState: (s: StudioState) => void; d: Derived };

export const axisText = "fill-zinc-500 dark:fill-zinc-400";
export const valueText = "fill-zinc-800 dark:fill-zinc-100";

export function upcomingExams(d: Derived) {
  return d.plan.exams.filter((e) => e.status === "upcoming" || e.status === "today");
}

/** Shared exam picker (chips in the exam colors). */
export function ExamChips({ d, value, onPick }: { d: Derived; value: string; onPick: (id: string) => void }) {
  return (
    <div className="mb-2 flex flex-wrap gap-1">
      {upcomingExams(d).map((e) => {
        const on = e.id === value;
        return (
          <button
            key={e.id}
            type="button"
            onClick={() => onPick(e.id)}
            aria-pressed={on}
            className={`max-w-[9rem] truncate rounded-full border px-2.5 py-0.5 text-xs font-bold transition ${on ? "text-white" : "bg-transparent text-zinc-600 dark:text-zinc-300"}`}
            style={{ borderColor: d.colorOf(e.id), backgroundColor: on ? d.colorOf(e.id) : undefined }}
          >
            {d.nameOf(e.id)}
          </button>
        );
      })}
    </div>
  );
}

/* 1 · Pomodoro cycle timeline of the busiest day (interactive: sliders change the rhythm of the whole plan) */
export function PomodoroCycleCard({ state, setState, d }: StudyIndicatorProps) {
  const t = useStudyT();
  const f = useFmt();
  const p = sanitizePomodoro(state.pomodoro);
  const peak = d.plan.totals.peakDay;
  const day = peak >= 0 ? d.plan.days[peak] : null;
  const s = pomodoroForFocus(day?.usedMinutes ?? 0, p);
  const [fitRef, W] = useFitWidth(400);
  const H = 112;
  const total = Math.max(30, s.wallMinutes);
  const x = (m: number) => 4 + (m / total) * (W - 8);
  const tick = total > 360 ? 60 : 30;
  const set = (k: keyof PomodoroSettings, v: number) => setState({ ...state, pomodoro: { ...state.pomodoro, [k]: v } });
  const sliders: { k: keyof PomodoroSettings; key: string; lo: number; hi: number; step: number; color: string }[] = [
    { k: "workMinutes", key: "work", lo: 10, hi: 60, step: 5, color: BREAK_COLORS.work },
    { k: "shortBreakMinutes", key: "short", lo: 0, hi: 15, step: 1, color: BREAK_COLORS.short },
    { k: "longBreakMinutes", key: "long", lo: 0, hi: 40, step: 5, color: BREAK_COLORS.long },
    { k: "longBreakEvery", key: "every", lo: 2, hi: 6, step: 1, color: "#64748b" },
  ];
  const clock = (m: number) => `${Math.floor(m / 60)}:${String(Math.round(m % 60)).padStart(2, "0")}`;

  return (
    <SectionCard title={t("ind.pomodoro.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.pomodoro.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <div className="w-[400px] max-w-full">
            <div className="mb-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {sliders.map((sl) => (
                <label key={sl.k} className="block text-xs">
                  <span className="flex justify-between font-semibold text-zinc-600 dark:text-zinc-300">
                    <span>{t(`input.${sl.key}`)}</span>
                    <span dir="ltr" className="font-mono" style={{ color: sl.color }}>
                      {f.n(p[sl.k])}
                    </span>
                  </span>
                  <input
                    type="range"
                    min={sl.lo}
                    max={sl.hi}
                    step={sl.step}
                    value={p[sl.k]}
                    onChange={(e) => set(sl.k, Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: sl.color }}
                    aria-label={t(`input.${sl.key}`)}
                  />
                </label>
              ))}
            </div>
            <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.pomodoro.title")} className="max-w-full">
              <text style={{ fontSize: svgPx(12) }} x={4} y={12} fontWeight={700} className={valueText}>
                {day ? `${f.day(day.date)} · ${f.h(day.usedMinutes)}` : "—"}
              </text>
              {s.blocks.map((b, i) => (
                <g key={i} style={{ transition: "all 300ms ease" }}>
                  <rect x={x(b.start)} y={b.kind === "work" ? 22 : 34} width={Math.max(1, x(b.start + b.minutes) - x(b.start) - 1)} height={b.kind === "work" ? 40 : 16} rx={4} fill={BREAK_COLORS[b.kind]} />
                  {b.kind === "work" && x(b.start + b.minutes) - x(b.start) > 14 && (
                    <text style={{ fontSize: svgPx(12) }} x={(x(b.start) + x(b.start + b.minutes)) / 2} y={46} textAnchor="middle" fontWeight={800} fill="white">
                      {b.n}
                    </text>
                  )}
                </g>
              ))}
              <line x1={4} x2={W - 4} y1={70} y2={70} stroke="currentColor" strokeOpacity={0.35} />
              {Array.from({ length: Math.floor(total / tick) + 1 }, (_, i) => i * tick).map((m) => (
                <g key={m}>
                  <line x1={x(m)} x2={x(m)} y1={70} y2={74} stroke="currentColor" strokeOpacity={0.4} />
                  <text style={{ fontSize: svgPx(12) }} x={x(m)} y={85} textAnchor="middle" className={axisText}>
                    {clock(m)}
                  </text>
                </g>
              ))}
              {(["work", "short", "long"] as const).map((k, i) => (
                <g key={k} transform={`translate(${4 + i * 110}, 96)`}>
                  <rect width={10} height={10} rx={2} fill={BREAK_COLORS[k]} />
                  <text style={{ fontSize: svgPx(12) }} x={14} y={9} fontWeight={600} className={valueText}>
                    {t(`ind.pomodoro.${k}`)}
                  </text>
                </g>
              ))}
            </svg>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{t("ind.pomodoro.hint")}</p>
          </div>
        }
        rows={[
          { label: t("ind.pomodoro.pomodoros"), value: f.n(s.pomodoros), note: s.pomodoros > s.fullPomodoros ? t("ind.pomodoro.last", { n: s.lastPomodoroMinutes }) : undefined },
          { label: t("ind.pomodoro.shortBreaks"), value: `${f.n(s.shortBreaks)} × ${f.n(p.shortBreakMinutes)}` },
          { label: t("ind.pomodoro.longBreaks"), value: `${f.n(s.longBreaks)} × ${f.n(p.longBreakMinutes)}` },
          { label: t("ind.pomodoro.focus"), value: f.min(s.focusMinutes) },
          { label: t("ind.pomodoro.breaks"), value: f.min(s.breakMinutes) },
          { label: t("ind.pomodoro.wall"), value: clock(s.wallMinutes) },
          { label: t("ind.pomodoro.ratio"), value: f.pct(s.focusRatio, 1), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 2 · Spaced-review schedule (timeline with stations per exam) */
export function ReviewScheduleCard({ d }: StudyIndicatorProps) {
  const t = useStudyT();
  const f = useFmt();
  const exams = upcomingExams(d);
  const days = d.plan.days;
  const n = Math.max(1, days.length);
  const [fitRef, W] = useFitWidth(400);
  const LW = 20;
  const RH = 30;
  const H = 18 + exams.length * RH + 30;
  const x = (i: number) => LW + ((i + 0.5) / n) * (W - LW - 6);
  const step = Math.ceil(n / 9);
  const reviewsTotal = exams.reduce((a, e) => a + e.reviewDays.length, 0);
  const reviewMinutes = exams.reduce((a, e) => a + e.reviewMinutes, 0);

  return (
    <SectionCard title={t("ind.reviews.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.reviews.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <div className="w-[400px] max-w-full">
            <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.reviews.title")} className="max-w-full">
              {exams.map((e, ri) => {
                const y = 18 + ri * RH + RH / 2;
                const c = d.colorOf(e.id);
                return (
                  <g key={e.id}>
                    <circle cx={LW / 2} cy={y} r={7} fill={c} />
                    <text style={{ fontSize: svgPx(12) }} x={LW / 2} y={y + 3.5} textAnchor="middle" fontWeight={800} fill="white">
                      {ri + 1}
                    </text>
                    <line x1={x(0)} x2={x(Math.max(0, e.examIndex))} y1={y} y2={y} stroke={c} strokeOpacity={0.35} strokeWidth={2} />
                    {e.studyDays
                      .filter((sd) => !e.reviewDays.includes(sd))
                      .map((sd) => (
                        <circle key={sd} cx={x(sd)} cy={y} r={3} fill={c} fillOpacity={0.7} />
                      ))}
                    {e.reviewDays.map((rd) => (
                      <g key={rd}>
                        <rect x={x(rd) - 5} y={y - 5} width={10} height={10} transform={`rotate(45 ${x(rd)} ${y})`} fill="white" stroke={c} strokeWidth={2} />
                        <text style={{ fontSize: svgPx(12) }} x={x(rd)} y={y - 9} textAnchor="middle" fontWeight={700} fill={c}>
                          {`−${e.examIndex - rd}`}
                        </text>
                      </g>
                    ))}
                    <text style={{ fontSize: svgPx(14) }} x={x(e.examIndex)} y={y + 4.5} textAnchor="middle" fill={c}>
                      ★
                    </text>
                  </g>
                );
              })}
              <line x1={LW} x2={W - 6} y1={H - 24} y2={H - 24} stroke="currentColor" strokeOpacity={0.3} />
              {days.map((day) =>
                day.index % step === 0 ? (
                  <text style={{ fontSize: svgPx(12) }} key={day.index} x={x(day.index)} y={H - 12} textAnchor="middle" className={axisText}>
                    {f.short(day.date)}
                  </text>
                ) : null,
              )}
            </svg>
            <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-zinc-600 dark:text-zinc-300">
              <span>● {t("ind.reviews.learn")}</span>
              <span>◆ {t("ind.reviews.review")}</span>
              <span>★ {t("ind.reviews.exam")}</span>
            </div>
          </div>
        }
        rows={[
          ...exams.map((e) => ({
            label: d.nameOf(e.id),
            value: e.reviewDays.length ? e.reviewDays.map((rd) => f.short(days[rd]?.date ?? "")).join(" · ") : t("ind.reviews.none"),
            note: e.reviewDays.length ? `${f.n(e.reviewDays.length)} × ${f.h(e.reviewEachMinutes)}` : undefined,
          })),
          { label: t("ind.reviews.total"), value: `${f.n(reviewsTotal)} · ${f.h(reviewMinutes)}`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 3 · Forgetting curve up to the exam, with and without the booked reviews (click an exam) */
export function ForgettingCurveCard({ d }: StudyIndicatorProps) {
  const t = useStudyT();
  const f = useFmt();
  const exams = upcomingExams(d).filter((e) => e.status === "upcoming");
  const [pick, setPick] = useState<string>("");
  const e = exams.find((x) => x.id === pick) ?? exams.find((x) => x.reviewDays.length > 0) ?? exams[0];
  const [fitRef, W] = useFitWidth(400);
  const H = 180;
  const L = 34;
  const B = 150;
  if (!e) return null;
  const learnDay = e.studyDays[0] ?? 0;
  const booked = e.reviewDays.filter((rd) => e.studyDays.includes(rd));
  const withR = retentionCurve({ learnDay, reviewDays: booked, endDay: e.examIndex });
  const without = retentionCurve({ learnDay, reviewDays: [], endDay: e.examIndex });
  const span = Math.max(1, e.examIndex);
  const x = (tt: number) => L + (tt / span) * (W - L - 10);
  const y = (r: number) => 12 + (1 - r) * (B - 12);
  const path = (pts: { t: number; r: number }[]) => pts.map((p, i) => `${i ? "L" : "M"} ${x(p.t).toFixed(1)} ${y(p.r).toFixed(1)}`).join(" ");
  const c = d.colorOf(e.id);

  return (
    <SectionCard title={t("ind.curve.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.curve.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <div className="w-[400px] max-w-full">
            <ExamChips d={d} value={e.id} onPick={setPick} />
            <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.curve.title")} className="max-w-full">
              {[0, 0.25, 0.5, 0.75, 1].map((r) => (
                <g key={r}>
                  <line x1={L} x2={W - 10} y1={y(r)} y2={y(r)} stroke="currentColor" strokeOpacity={0.12} />
                  <text style={{ fontSize: svgPx(12) }} x={L - 4} y={y(r) + 3} textAnchor="end" className={axisText}>{`${r * 100}%`}</text>
                </g>
              ))}
              <path d={path(without.points)} fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" />
              <path d={path(withR.points)} fill="none" stroke={c} strokeWidth={2.5} style={{ transition: "d 400ms ease" }} />
              {booked.map((rd) => (
                <g key={rd}>
                  <line x1={x(rd)} x2={x(rd)} y1={12} y2={B} stroke={c} strokeOpacity={0.35} strokeDasharray="2 3" />
                  <rect x={x(rd) - 4} y={y(1) - 4} width={8} height={8} transform={`rotate(45 ${x(rd)} ${y(1)})`} fill="white" stroke={c} strokeWidth={1.5} />
                </g>
              ))}
              <line x1={x(e.examIndex)} x2={x(e.examIndex)} y1={12} y2={B} stroke="#ef4444" strokeWidth={1.5} />
              <circle cx={x(e.examIndex)} cy={y(withR.atEnd)} r={5} fill={c} stroke="white" strokeWidth={1.5} />
              <circle cx={x(e.examIndex)} cy={y(without.atEnd)} r={4} fill="#94a3b8" stroke="white" strokeWidth={1.5} />
              <text style={{ fontSize: svgPx(12) }} x={x(e.examIndex) - 8} y={y(withR.atEnd) + 4} textAnchor="end" fontWeight={800} fill={c}>
                {f.pct(withR.atEnd)}
              </text>
              <text style={{ fontSize: svgPx(12) }} x={x(e.examIndex) - 8} y={Math.min(B - 4, y(without.atEnd) + 4)} textAnchor="end" fontWeight={700} fill="#64748b">
                {f.pct(without.atEnd)}
              </text>
              <line x1={L} x2={W - 10} y1={B} y2={B} stroke="currentColor" strokeOpacity={0.35} />
              {Array.from({ length: span + 1 }, (_, i) => i)
                .filter((i) => i % Math.ceil((span + 1) / 8) === 0 || i === span)
                .map((i) => (
                  <text style={{ fontSize: svgPx(12) }} key={i} x={x(i)} y={B + 13} textAnchor="middle" className={axisText}>
                    {i}
                  </text>
                ))}
              <text style={{ fontSize: svgPx(12) }} x={W - 10} y={B + 27} textAnchor="end" className={axisText}>
                {t("ind.curve.axis")}
              </text>
            </svg>
            <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-zinc-600 dark:text-zinc-300">
              <span style={{ color: c }}>━ {t("ind.curve.with")}</span>
              <span className="text-zinc-400">┅ {t("ind.curve.without")}</span>
            </div>
          </div>
        }
        rows={[
          { label: t("ind.curve.firstStudy"), value: f.short(d.plan.days[learnDay]?.date ?? "") },
          { label: t("ind.curve.reviews"), value: f.n(booked.length), note: booked.map((rd) => `−${e.examIndex - rd}`).join(" · ") || undefined },
          { label: t("ind.curve.stability"), value: t("ind.curve.days", { n: f.n(withR.stabilityAtEnd, 1) }), note: "S₀ = 1.5 · ×2.5" },
          { label: t("ind.curve.recallWithout"), value: f.pct(without.atEnd, 1) },
          { label: t("ind.curve.recallWith"), value: f.pct(withR.atEnd, 1) },
          { label: t("ind.curve.gain"), value: `+${f.n((withR.atEnd - without.atEnd) * 100, 1)}`, note: t("ind.curve.points"), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 4 · Priority formula: difficulty × credits × urgency, with each exam's share */
export function PriorityFormulaCard({ d }: StudyIndicatorProps) {
  const t = useStudyT();
  const f = useFmt();
  const exams = upcomingExams(d);
  const sum = exams.reduce((a, e) => a + e.priority, 0) || 1;
  const max = Math.max(1, ...exams.map((e) => e.priority));
  const W = 400;
  const RH = 34;
  const H = 22 + exams.length * RH;
  const box = (bx: number, by: number, v: string, color: string, w = 40) => (
    <g>
      <rect x={bx} y={by} width={w} height={22} rx={5} fill={color} fillOpacity={0.14} stroke={color} strokeOpacity={0.6} />
      <text x={bx + w / 2} y={by + 15} textAnchor="middle" fontSize={11} fontWeight={800} fill={color}>
        {v}
      </text>
    </g>
  );

  return (
    <SectionCard title={t("ind.priority.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ind.priority.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("ind.worked")}
        indicator={
          <svg data-annotation="" width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("ind.priority.title")} className="max-w-full">
            {[
              { x: 22, k: "difficulty" },
              { x: 74, k: "credits" },
              { x: 126, k: "urgency" },
              { x: 186, k: "priority" },
            ].map((h) => (
              <text key={h.k} x={h.x + 22} y={12} textAnchor="middle" fontSize={9} fontWeight={700} className={axisText}>
                {t(`ind.priority.${h.k}`)}
              </text>
            ))}
            {exams.map((e, i) => {
              const y = 20 + i * RH;
              const c = d.colorOf(e.id);
              const bw = (e.priority / max) * (W - 252);
              return (
                <g key={e.id}>
                  <circle cx={9} cy={y + 11} r={7} fill={c} />
                  <text x={9} y={y + 14.5} textAnchor="middle" fontSize={9} fontWeight={800} fill="white">
                    {i + 1}
                  </text>
                  {box(22, y, String(e.difficulty), "#ef4444")}
                  <text x={68} y={y + 15} textAnchor="middle" fontSize={12} className={valueText}>×</text>
                  {box(74, y, String(e.credits), "#8b5cf6")}
                  <text x={120} y={y + 15} textAnchor="middle" fontSize={12} className={valueText}>×</text>
                  {box(126, y, f.n(e.urgency, 2), "#f59e0b", 48)}
                  <text x={180} y={y + 15} textAnchor="middle" fontSize={12} className={valueText}>=</text>
                  {box(186, y, f.n(e.priority, 1), c, 52)}
                  <rect x={246} y={y + 4} width={Math.max(2, bw)} height={14} rx={4} fill={c} style={{ transition: "width 400ms ease" }} />
                  <text x={250 + Math.max(2, bw)} y={y + 15} fontSize={10} fontWeight={700} className={valueText}>
                    {f.pct(e.priority / sum)}
                  </text>
                </g>
              );
            })}
          </svg>
        }
        rows={[
          ...exams.map((e) => ({
            label: d.nameOf(e.id),
            value: f.n(e.priority, 2),
            note: `${t("ind.priority.daysLeft", { n: e.daysLeft })} · 1 + 7 ÷ ${Math.max(1, e.daysLeft)} = ${f.n(e.urgency, 2)}`,
          })),
          { label: t("ind.priority.formula"), value: f.n(sum, 1), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}
