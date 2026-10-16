"use client";
import { sanitizePomodoro } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import { useFmt, useStudyT, type Derived, type StudioState } from "./studio";

type Props = { state: StudioState; d: Derived };

/** Live 2D plan map: one row per exam, one column per day; shade = minutes, ◆ = review, ★ = exam day. */
function PlanMap({ d }: { d: Derived }) {
  const { plan } = d;
  const exams = plan.exams.filter((e) => e.status === "upcoming" || e.status === "today");
  const n = Math.max(1, plan.days.length);
  const W = 300;
  const LW = 18;
  const TOP = 46;
  const RH = Math.min(36, Math.max(18, 200 / Math.max(1, exams.length)));
  const H = TOP + exams.length * RH + 22;
  const cw = (W - LW - 2) / n;
  const maxCell = Math.max(15, ...plan.days.flatMap((day) => exams.map((e) => day.sessions.filter((s) => s.examId === e.id).reduce((a, s) => a + s.minutes, 0))));
  const maxCap = Math.max(60, ...plan.days.map((day) => day.capacityMinutes));
  const step = Math.ceil(n / 10);
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} role="img" style={{ direction: "ltr" }} className="mx-auto block max-h-[300px]">
      {/* capacity strip */}
      {plan.days.map((day) => {
        const x = LW + day.index * cw;
        const capH = (day.capacityMinutes / maxCap) * 36;
        const useH = (day.usedMinutes / maxCap) * 36;
        return (
          <g key={day.index}>
            <rect x={x + 0.5} y={40 - capH} width={Math.max(1, cw - 1)} height={capH} rx={1.5} className="fill-zinc-200 dark:fill-zinc-700" />
            <rect x={x + 0.5} y={40 - useH} width={Math.max(1, cw - 1)} height={useH} rx={1.5} fill="#2563eb" style={{ transition: "all 400ms ease" }} />
          </g>
        );
      })}
      {exams.map((e, ri) => {
        const y = TOP + ri * RH;
        const color = d.colorOf(e.id);
        return (
          <g key={e.id}>
            <circle cx={LW / 2} cy={y + RH / 2} r={7} fill={color} />
            <text x={LW / 2} y={y + RH / 2 + 3.5} textAnchor="middle" fontSize={9} fontWeight={800} fill="white">
              {ri + 1}
            </text>
            {plan.days.map((day) => {
              const x = LW + day.index * cw;
              const mins = day.sessions.filter((s) => s.examId === e.id).reduce((a, s) => a + s.minutes, 0);
              const review = day.sessions.some((s) => s.examId === e.id && s.kind === "review");
              if (day.index > e.examIndex) return null;
              if (day.index === e.examIndex) {
                const cx = x + cw / 2;
                const cy = y + RH / 2;
                const r = Math.min(cw, RH) * 0.42;
                const pts = Array.from({ length: 10 }, (_, k) => {
                  const a = -Math.PI / 2 + (k * Math.PI) / 5;
                  const rr = k % 2 ? r * 0.45 : r;
                  return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
                }).join(" ");
                return <polygon key={day.index} points={pts} fill={color} stroke="white" strokeWidth={0.8} />;
              }
              return (
                <g key={day.index}>
                  <rect
                    x={x + 0.5}
                    y={y + 1}
                    width={Math.max(1, cw - 1)}
                    height={RH - 2}
                    rx={2}
                    fill={color}
                    fillOpacity={mins ? 0.25 + (0.75 * mins) / maxCell : 0.06}
                    style={{ transition: "fill-opacity 400ms ease" }}
                  />
                  {review && (
                    <rect x={x + cw / 2 - 3} y={y + RH / 2 - 3} width={6} height={6} transform={`rotate(45 ${x + cw / 2} ${y + RH / 2})`} fill="white" stroke={color} strokeWidth={1} />
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
      {plan.days.map((day) =>
        day.index % step === 0 ? (
          <text key={day.index} x={LW + day.index * cw + cw / 2} y={H - 8} textAnchor="middle" fontSize={8.5} className="fill-zinc-500 dark:fill-zinc-400">
            {Number(day.date.slice(8))}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export default function StudyStudioResult({ state, d }: Props) {
  const t = useStudyT();
  const f = useFmt();
  const { plan } = d;
  const tot = plan.totals;
  const p = sanitizePomodoro(state.pomodoro);
  const exams = plan.exams.filter((e) => e.status === "upcoming" || e.status === "today");
  const label = (id: string, kind: string, m: number) => `${d.nameOf(id)}${kind === "review" ? ` (${t("result.review")})` : ""} ${f.h(m)}`;

  const groups: LiveTableGroup[] = [
    {
      title: t("result.groupDays"),
      rows: plan.days.map((day, i) => {
        const parts = day.sessions.map((s) => label(s.examId, s.kind, s.minutes));
        const examsToday = day.examIds.map((id) => d.nameOf(id)).join(", ");
        const pomo = d.pomodoroDays[i];
        return {
          label: f.day(day.date),
          formula: [examsToday && `★ ${t("result.examDay", { names: examsToday })}`, parts.join(" · ") || (day.usableMinutes ? t("result.buffer") : t("result.noStudy")), pomo.pomodoros ? t("result.pomodoroCount", { n: pomo.pomodoros }) : ""]
            .filter(Boolean)
            .join(" · "),
          value: `${f.n(day.usedMinutes / 60, 2)} / ${f.n(day.usableMinutes / 60, 2)}`,
          unit: t("units.h"),
          emphasize: day.examIds.length > 0,
        };
      }),
    },
    {
      title: t("result.groupExams"),
      rows: exams.map((e) => ({
        label: `${d.nameOf(e.id)} · ${f.short(state.exams.find((x) => x.id === e.id)?.date ?? "")}`,
        formula: `${e.difficulty} × ${e.credits} × ${f.n(e.urgency, 2)} = ${f.n(e.priority, 1)}`,
        value: `${f.n(e.plannedMinutes / 60, 2)} / ${f.n(e.targetMinutes / 60, 2)}`,
        unit: t("units.h"),
        emphasize: e.shortfallMinutes > 0,
      })),
    },
    {
      title: t("result.groupTotals"),
      rows: [
        { label: t("result.capacity"), formula: t("result.daysCount", { n: tot.horizonDays }), value: f.h(tot.capacityMinutes) },
        { label: t("result.required"), formula: exams.map((e) => f.n(e.targetMinutes / 60, 2)).join(" + "), value: f.h(tot.requiredMinutes) },
        { label: t("result.planned"), formula: t("result.studyDays", { n: tot.studyDays }), value: f.h(tot.plannedMinutes) },
        { label: t("result.buffer"), formula: `${f.n(tot.capacityMinutes / 60, 2)} − ${f.n(tot.plannedMinutes / 60, 2)}`, value: f.h(tot.freeMinutes) },
        { label: t("result.shortfall"), formula: `${f.n(tot.requiredMinutes / 60, 2)} − ${f.n(tot.plannedMinutes / 60, 2)}`, value: f.h(tot.shortfallMinutes), emphasize: tot.shortfallMinutes > 0 },
        { label: t("result.load"), formula: `${f.n(tot.requiredMinutes / 60, 2)} ÷ ${f.n(tot.capacityMinutes / 60, 2)}`, value: Number.isFinite(tot.loadRatio) ? f.pct(tot.loadRatio) : "∞" },
        { label: t("result.pomodoros"), formula: `${p.workMinutes}/${p.shortBreakMinutes}/${p.longBreakMinutes} × ${p.longBreakEvery}`, value: f.n(d.pomodoroTotals.pomodoros) },
        { label: t("result.wall"), formula: `${f.n(d.pomodoroTotals.focus / 60, 2)} + ${f.n((d.pomodoroTotals.wall - d.pomodoroTotals.focus) / 60, 2)}`, value: f.h(d.pomodoroTotals.wall), emphasize: true },
      ],
    },
  ];

  const ok = tot.shortfallMinutes === 0;
  return (
    <SectionCard title={t("result.title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="p-3 lg:flex lg:flex-1 lg:flex-col">
      <div
        role="status"
        className={`rounded-lg p-2.5 text-sm font-semibold ${ok ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300"}`}
        data-bp-inner
      >
        {exams.length === 0 ? t("result.empty") : ok ? t("result.ok", { free: f.h(tot.freeMinutes) }) : t("result.short", { short: f.h(tot.shortfallMinutes) })}
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1.5 text-center">
        {[
          { k: t("result.planned"), v: f.h(tot.plannedMinutes, 1) },
          { k: t("result.required"), v: f.h(tot.requiredMinutes, 1) },
          { k: ok ? t("result.buffer") : t("result.shortfall"), v: f.h(ok ? tot.freeMinutes : tot.shortfallMinutes, 1) },
          { k: t("result.pomodoros"), v: f.n(d.pomodoroTotals.pomodoros) },
        ].map((s) => (
          <div key={s.k} className="rounded-lg bg-blue-50 px-1 py-1.5 dark:bg-blue-500/10" data-bp-inner>
            <p className="truncate text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">{s.k}</p>
            <p dir="ltr" className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">
              {s.v}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 lg:flex lg:flex-1 lg:flex-col">
        <LiveTableFill>
          <LiveTable3DLayout
            headings={[t("result.colDay"), t("result.colPlan"), t("result.colHours")]}
            groups={groups}
            drawing={<PlanMap d={d} />}
            caption={
              <span className="flex flex-wrap justify-center gap-x-2 gap-y-0.5">
                <span className="w-full text-center">{t("result.caption")}</span>
                {exams.map((e, i) => (
                  <span key={e.id} className="inline-flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: d.colorOf(e.id) }} />
                    {`${i + 1}. ${d.nameOf(e.id)}`}
                  </span>
                ))}
              </span>
            }
          />
        </LiveTableFill>
      </div>
    </SectionCard>
  );
}
