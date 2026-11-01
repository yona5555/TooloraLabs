"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { DayCode } from "@tooloralabs/tools";
import { classColor, fmt, hm, type Derived, type StudioState } from "./studio";
import { svgPx } from "@/components/tool-ui/svgPx";

export function useSchedT() {
  return useTranslations("tools.class-schedule-builder.studio");
}

export const axisText = "fill-zinc-500 dark:fill-zinc-400";
export const valueText = "fill-zinc-800 dark:fill-zinc-100";
export const gridLine = "stroke-zinc-200 dark:stroke-zinc-700";

export function useRtl() {
  return useLocale() === "ar";
}

/** "1.5 h" / "45 min" formatters in the page language. */
export function useUnits() {
  const t = useSchedT();
  return {
    h: (minutes: number, digits = 1) => t("units.hours", { n: fmt(minutes / 60, digits) }),
    min: (minutes: number) => t("units.minutes", { n: fmt(minutes) }),
    dur: (minutes: number) => (Math.abs(minutes) < 60 ? t("units.minutes", { n: fmt(minutes) }) : t("units.hours", { n: fmt(minutes / 60, 1) })),
  };
}

/** Day columns in reading order: right-to-left pages put Monday on the right. */
export function useDayOrder(days: DayCode[]) {
  const rtl = useRtl();
  return rtl ? [...days].reverse() : days;
}

/** Hour window that frames every class (at least 08:00–18:00). */
export function hourWindow(d: Derived): [number, number] {
  const lo = Math.min(8, Math.floor((d.stats.earliestStart ?? 8 * 60) / 60));
  const hi = Math.max(18, Math.ceil((d.stats.latestEnd ?? 18 * 60) / 60));
  return [lo, hi];
}

/** Lane per meeting so overlapping classes sit side by side; only each overlapping cluster is split. */
function lanes(meetings: { id: string; startMinutes: number; endMinutes: number }[]) {
  const out = new Map<string, { k: number; count: number }>();
  let cluster: { id: string; k: number }[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -1;
  const flush = () => {
    cluster.forEach((c) => out.set(c.id, { k: c.k, count: Math.max(1, laneEnds.length) }));
    cluster = [];
    laneEnds = [];
  };
  for (const m of meetings) {
    if (m.startMinutes >= clusterEnd) flush();
    let k = laneEnds.findIndex((e) => e <= m.startMinutes);
    if (k < 0) {
      k = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[k] = m.endMinutes;
    cluster.push({ id: m.id, k });
    clusterEnd = Math.max(clusterEnd, m.endMinutes);
  }
  flush();
  return out;
}

/** Live 2D weekly grid: every class block, overlaps hatched red, too-short gaps marked amber. Click a block to edit it. */
export function WeekGrid({ state, d, onPick, compact = false }: { state: StudioState; d: Derived; onPick?: (id: string) => void; compact?: boolean }) {
  const svgId = useId();
  const t = useSchedT();
  const days = useDayOrder(d.shownDays);
  const [h0, h1] = hourWindow(d);
  const W = 300;
  const AX = 30;
  const TOP = 18;
  const PH = compact ? 18 : 22;
  // room under the last hour line for its 12px label (it sits centred on the line)
  const H = TOP + (h1 - h0) * PH + 9;
  const cw = (W - AX - 2) / days.length;
  const y = (min: number) => TOP + ((min - h0 * 60) / 60) * PH;
  const colX = (day: DayCode) => AX + days.indexOf(day) * cw;

  return (
    <FitSvg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("result.gridAria")} style={{ direction: "ltr" }} className="mx-auto block max-h-[340px]">
      <defs>
        <pattern id={`${svgId}csb-hatch`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="5" fill="#ef4444" fillOpacity="0.25" />
          <line x1="0" y1="0" x2="0" y2="5" stroke="#dc2626" strokeWidth="2.2" />
        </pattern>
      </defs>
      {Array.from({ length: h1 - h0 + 1 }, (_, i) => h0 + i).map((h) => (
        <g key={h}>
          <line x1={AX} x2={W} y1={y(h * 60)} y2={y(h * 60)} className={gridLine} strokeWidth={h % 2 ? 0.5 : 1} />
          {(h - h0) % (compact ? 2 : 1) === 0 && (
            <text style={{ fontSize: svgPx(12) }} x={AX - 3} y={y(h * 60) + 3} textAnchor="end" className={axisText}>
              {hm(h * 60)}
            </text>
          )}
        </g>
      ))}
      {days.map((day) => {
        const ds = d.stats.days.find((s) => s.day === day);
        const lane = lanes(ds?.meetings ?? []);
        const x0 = colX(day);
        return (
          <g key={day}>
            <rect x={x0 + 1} y={TOP} width={cw - 2} height={H - TOP - 4} rx={3} className="fill-zinc-100/60 dark:fill-zinc-800/40" />
            <text style={{ fontSize: svgPx(12) }} x={x0 + cw / 2} y={11} textAnchor="middle" fontWeight={800} className={ds?.classCount ? valueText : axisText}>
              {t(`days.${day}`)}
            </text>
            {(ds?.meetings ?? []).map((m) => {
              const c = d.byId.get(m.id);
              if (!c) return null;
              const { k, count } = lane.get(m.id) ?? { k: 0, count: 1 };
              const bw = (cw - 4) / count;
              const bx = x0 + 2 + k * bw;
              const by = y(m.startMinutes);
              const bh = Math.max(3, y(m.endMinutes) - by);
              const on = state.selectedId === m.id;
              return (
                <g key={m.id} data-annotation="" onClick={onPick ? () => onPick(m.id) : undefined} style={{ cursor: onPick ? "pointer" : undefined }}>
                  <title>{`${c.code} ${c.name} · ${hm(m.startMinutes)}–${hm(m.endMinutes)}${c.room ? ` · ${c.room}` : ""}`}</title>
                  <rect
                    x={bx + 0.5}
                    y={by + 0.5}
                    width={Math.max(2, bw - 1)}
                    height={bh - 1}
                    rx={3}
                    fill={classColor(c)}
                    fillOpacity={on ? 1 : 0.85}
                    stroke={on ? "currentColor" : "none"}
                    strokeWidth={on ? 1.5 : 0}
                    className={on ? "text-zinc-900 dark:text-white" : undefined}
                    style={{ transition: "all 300ms ease" }}
                  />
                  {bh >= 13 && bw >= 22 && (
                    <text x={bx + bw / 2} y={by + Math.min(bh / 2 + 3, 11)} textAnchor="middle" fontSize={bw < 34 ? 6.5 : 7.5} fontWeight={800} fill="white">
                      {(c.code || c.name).slice(0, bw < 34 ? 6 : 9)}
                    </text>
                  )}
                  {bh >= 26 && bw >= 30 && !compact && (
                    <text x={bx + bw / 2} y={by + 20} textAnchor="middle" fontSize={6.5} fill="white" fillOpacity={0.9}>
                      {hm(m.startMinutes)}
                    </text>
                  )}
                </g>
              );
            })}
            {d.overlaps
              .filter((o) => o.day === day)
              .map((o, i) => (
                <rect key={`o${i}`} x={x0 + 2} y={y(o.startMinutes)} width={cw - 4} height={Math.max(2, y(o.endMinutes) - y(o.startMinutes))} fill={`url(#${svgId}csb-hatch)`} stroke="#dc2626" strokeWidth={1} rx={2} pointerEvents="none" />
              ))}
            {d.tight
              .filter((o) => o.day === day)
              .map((o, i) => (
                <rect key={`b${i}`} x={x0 + 1} y={y(o.startMinutes) - 1.5} width={cw - 2} height={Math.max(3, y(o.endMinutes) - y(o.startMinutes) + 3)} fill="#f59e0b" rx={1.5} pointerEvents="none" />
              ))}
          </g>
        );
      })}
    </FitSvg>
  );
}
