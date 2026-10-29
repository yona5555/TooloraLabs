"use client";
import { AlertTriangle, CalendarPlus, CheckCircle2 } from "lucide-react";
import { CLASS_KINDS, DAY_CODES, scheduleToIcs, type ClassKind } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import { downloadTextFile } from "@/lib/export";
import { classColor, fmt, hm, toMinutes, type Derived, type StudioState } from "./studio";
import { useSchedT, useUnits, WeekGrid } from "./ScheduleShared";
import ResultActionButton from "@/components/tool-ui/ResultActionButton";

type Props = { state: StudioState; onChange: (next: StudioState) => void; d: Derived; timeZone: string | null };

export function useIcsExport(state: StudioState, d: Derived, timeZone: string | null) {
  const t = useSchedT();
  const tzid = state.useTz && timeZone ? timeZone : null;
  return {
    tzid,
    download: () => {
      const ics = scheduleToIcs(d.classes, {
        termStart: state.termStart,
        termEnd: state.termEnd,
        tzid,
        calendarName: t("ics.calendarName"),
        excludeDates: d.exclude,
        labels: {
          instructor: t("input.instructor"),
          credits: t("input.credits"),
          kind: Object.fromEntries(CLASS_KINDS.map((k) => [k, t(`kinds.${k}`)])) as Record<ClassKind, string>,
        },
      });
      downloadTextFile("class-schedule.ics", ics, "text/calendar;charset=utf-8");
    },
  };
}

export default function ScheduleStudioResult({ state, onChange, d, timeZone }: Props) {
  const t = useSchedT();
  const u = useUnits();
  const { stats } = d;
  const ics = useIcsExport(state, d, timeZone);
  const dayName = (day: string | null) => (day ? t(`daysLong.${day}`) : "—");
  const daysShort = (days: string[]) => days.map((x) => t(`days.${x}`)).join(" ");
  const status = d.overlaps.length ? "overlap" : d.tight.length ? "tight" : "clear";

  const groups: LiveTableGroup[] = [
    {
      title: t("result.groupWeek"),
      rows: [
        { label: t("result.classes"), formula: t("result.meetingsFormula", { n: fmt(stats.meetingsPerWeek) }), value: fmt(stats.classCount) },
        { label: t("result.contact"), formula: "Σ (end − start) × days", value: u.h(stats.totalMinutes), emphasize: true },
        { label: t("result.busy"), formula: t("result.busyFormula"), value: u.h(stats.busyMinutes) },
        { label: t("result.credits"), formula: "Σ credits", value: fmt(stats.totalCredits) },
        { label: t("result.campusDays"), formula: daysShort(stats.days.filter((x) => x.classCount).map((x) => x.day)), value: fmt(stats.campusDays) },
        { label: t("result.earliest"), formula: dayName(stats.earliestDay), value: stats.earliestStart === null ? "—" : hm(stats.earliestStart) },
        { label: t("result.latest"), formula: dayName(stats.latestDay), value: stats.latestEnd === null ? "—" : hm(stats.latestEnd) },
        { label: t("result.avgDay"), formula: t("result.avgDayFormula"), value: u.h(stats.averageCampusDayMinutes) },
      ],
    },
    {
      title: t("result.groupConflicts", { buffer: fmt(state.buffer) }),
      rows: d.conflicts.length
        ? d.conflicts.map((c) => {
            const a = d.byId.get(c.aId);
            const b = d.byId.get(c.bId);
            return {
              label: `${a?.code || c.aName} × ${b?.code || c.bName}`,
              formula: `${t(`days.${c.day}`)} ${hm(c.startMinutes)}–${hm(c.endMinutes)}`,
              value: c.kind === "overlap" ? t("result.overlapBy", { n: fmt(c.overlapMinutes) }) : t("result.gapOnly", { n: fmt(c.gapMinutes), buffer: fmt(state.buffer) }),
              emphasize: c.kind === "overlap",
            };
          })
        : [{ label: t("result.noConflicts"), formula: t("result.pairsChecked", { n: fmt((d.classes.length * (d.classes.length - 1)) / 2) }), value: "✓" }],
    },
    {
      title: t("result.groupDays"),
      rows: d.shownDays.map((day) => {
        const s = stats.days[DAY_CODES.indexOf(day)];
        return {
          label: t(`daysLong.${day}`),
          formula: s.classCount ? `${fmt(s.classCount)} · ${hm(s.firstStart ?? 0)}–${hm(s.lastEnd ?? 0)}` : t("result.dayOff"),
          value: u.h(s.scheduledMinutes),
        };
      }),
    },
    {
      title: t("result.groupClasses"),
      rows: state.classes.map((c) => {
        const len = Math.max(0, toMinutes(c.end) - toMinutes(c.start));
        return {
          label: c.code || c.name || t("input.untitled"),
          formula: `${daysShort(c.days)} ${c.start}–${c.end}`,
          value: u.h(len * c.days.length),
        };
      }),
    },
    {
      title: t("result.groupTerm"),
      rows: [
        { label: t("result.term"), formula: `${state.termStart} → ${state.termEnd}`, value: t("result.weeks", { n: fmt(d.weeks) }) },
        { label: t("result.breakDays"), formula: d.exclude.length ? `${state.breakStart} → ${state.breakEnd}` : "—", value: fmt(d.exclude.length) },
        { label: t("result.sessions"), formula: "Σ meetings in term − EXDATE", value: fmt(d.sessions.reduce((a, b) => a + b, 0)) },
        { label: t("result.termHours"), formula: "Σ sessions × length", value: u.h(d.termMinutes, 0), emphasize: true },
        { label: t("result.icsMode"), formula: ics.tzid ? `TZID=${ics.tzid}` : t("result.floating"), value: "RRULE WEEKLY" },
      ],
    },
  ];

  return (
    <SectionCard phoneRole="output" title={t("result.title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="p-3 lg:flex lg:flex-1 lg:flex-col">
      <div
        role="status"
        className={`flex items-start gap-2 rounded-lg p-2.5 text-sm ${
          status === "overlap"
            ? "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-200"
            : status === "tight"
              ? "bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200"
              : "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
        }`}
        data-bp-inner
      >
        {status === "clear" ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
        <div className="min-w-0">
          <p className="font-bold">
            {status === "overlap"
              ? t("result.statusOverlap", { n: d.overlaps.length })
              : status === "tight"
                ? t("result.statusTight", { n: d.tight.length, buffer: fmt(state.buffer) })
                : t("result.statusClear")}
          </p>
          {d.overlaps[0] && (
            <p className="text-xs">
              <bdi>{d.byId.get(d.overlaps[0].aId)?.code || d.overlaps[0].aName}</bdi> × <bdi>{d.byId.get(d.overlaps[0].bId)?.code || d.overlaps[0].bName}</bdi> ·{" "}
              {t(`daysLong.${d.overlaps[0].day}`)} <span dir="ltr">{`${hm(d.overlaps[0].startMinutes)}–${hm(d.overlaps[0].endMinutes)}`}</span>
            </p>
          )}
          {d.overlaps.length > 0 && d.tight.length > 0 && <p className="text-xs">{t("result.alsoTight", { n: d.tight.length })}</p>}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
        {[
          { k: t("result.contact"), v: u.h(stats.totalMinutes) },
          { k: t("result.credits"), v: fmt(stats.totalCredits) },
          { k: t("result.campusDays"), v: `${fmt(stats.campusDays)}/7` },
        ].map((x) => (
          <div key={x.k} className="rounded-lg bg-blue-50 px-1 py-1.5 dark:bg-blue-500/10" data-bp-inner>
            <p className="truncate text-xs font-semibold text-zinc-500 dark:text-zinc-400">{x.k}</p>
            <p dir="ltr" className="font-mono text-base font-extrabold text-blue-700 dark:text-blue-300">
              {x.v}
            </p>
          </div>
        ))}
      </div>

      <ResultActionButton action="download"
        type="button"
        onClick={ics.download}
        disabled={!d.classes.length || state.termEnd < state.termStart}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        <CalendarPlus size={16} />
        {t("result.downloadIcs")}
      </ResultActionButton>
      <p className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("result.icsNote")}</p>

      <div className="mt-3 lg:flex lg:flex-1 lg:flex-col">
        <LiveTableFill>
          <LiveTable3DLayout
            headings={[t("result.colItem"), t("result.colHow"), t("result.colValue")]}
            groups={groups}
            drawing={<WeekGrid state={state} d={d} onPick={(id) => onChange({ ...state, selectedId: id })} />}
            caption={
              <span className="flex flex-wrap justify-center gap-x-2 gap-y-0.5">
                <span className="w-full text-center">{t("result.gridCaption")}</span>
                {state.classes.slice(0, 10).map((c) => (
                  <span key={c.id} className="inline-flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: classColor(c) }} />
                    <bdi>{c.code || c.name}</bdi>
                  </span>
                ))}
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-red-500" />
                  {t("result.legendOverlap")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-amber-500" />
                  {t("result.legendTight")}
                </span>
              </span>
            }
          />
        </LiveTableFill>
      </div>
    </SectionCard>
  );
}
