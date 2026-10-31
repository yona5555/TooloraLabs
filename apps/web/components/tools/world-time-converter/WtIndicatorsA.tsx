"use client";
import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Pause, Play, Radio } from "lucide-react";
import {
  civilToUtcMs,
  utcMsToCivil,
  wtNightBand,
  wtPairOverlapMinutes,
  wtPlanMeeting,
  wtSolarElevation,
  wtSolarPosition,
  wtSunTimes,
  wtTerminatorLines,
  zonedParts,
  zoneOffsetMinutes,
  WT_ASTRONOMICAL_ELEVATION,
  WT_CIVIL_ELEVATION,
  WT_NAUTICAL_ELEVATION,
  WT_SUNRISE_ELEVATION,
} from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { LAND, WATER } from "./worldLand";
import { STATUS_COLORS, useNow, type CardProps } from "./state";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { svgPx } from "@/components/tool-ui/svgPx";
import { useFitWidth, useSvgUnitsPerPx } from "@/components/tool-ui/useFitWidth";
import { labelW, placeLabels } from "@/components/tool-ui/labelLayout";

export function useIndT() {
  return useTranslations("tools.world-time-converter.wt.ind");
}
export function useUnitT() {
  return useTranslations("tools.world-time-converter.wt.units");
}
const axisText = "fill-zinc-500 dark:fill-zinc-400";
const valueText = "fill-zinc-800 dark:fill-zinc-100";
const shortName = (s: string) => s.split(" / ")[0];

/** "3 h 30 m" from minutes, via the units messages. */
export function useDuration() {
  const tu = useUnitT();
  return (min: number) => {
    const h = Math.floor(Math.round(min) / 60);
    const m = Math.round(min) % 60;
    return m === 0 ? tu("h", { n: String(h) }) : tu("hm", { h: String(h), m: String(m) });
  };
}

/* 1 · Live day/night map (annotated reference points on an equirectangular world) */
export function WtDayNightMapCard({ d, f }: CardProps) {
  const now = useNow();
  const t = useIndT();
  const [shift, setShift] = useState(0); // minutes from now
  const [playing, setPlaying] = useState(false);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setShift((m) => (m >= 720 ? -720 : m + 10)), 60);
    return () => clearInterval(id);
  }, [playing]);

  const at = pinned ? d.conv.utcMs : now + shift * 60_000;
  const sun = wtSolarPosition(at);
  const sub = { lat: sun.subsolarLatDeg, lon: sun.subsolarLonDeg };
  const W = 720;
  const H = 360;
  const X = (lon: number) => ((lon + 180) / 360) * W;
  const Y = (lat: number) => ((90 - lat) / 180) * H;
  const path = (ring: [number, number][]) => `M${ring.map(([lo, la]) => `${X(lo).toFixed(1)},${Y(la).toFixed(1)}`).join("L")}Z`;
  const line = (pts: [number, number][]) => `M${pts.map(([lo, la]) => `${X(lo).toFixed(1)},${Y(la).toFixed(1)}`).join("L")}`;
  const land = useMemo(() => LAND.map(path).join(" "), []); // eslint-disable-line react-hooks/exhaustive-deps
  const water = useMemo(() => WATER.map(path).join(" "), []); // eslint-disable-line react-hooks/exhaustive-deps
  const bands = [WT_SUNRISE_ELEVATION, WT_CIVIL_ELEVATION, WT_NAUTICAL_ELEVATION, WT_ASTRONOMICAL_ELEVATION].map((h) => wtNightBand(sub, h, 2));
  const term = wtTerminatorLines(sub, WT_SUNRISE_ELEVATION, 2);
  const cities = d.all.map((c) => ({ c, el: wtSolarElevation({ lat: c.lat, lon: c.lon }, sub) }));
  const lit = cities.filter((x) => x.el > WT_SUNRISE_ELEVATION).length;
  const home = cities[0];
  const homeSun = wtSunTimes(home.c.lat, home.c.lon, zonedParts(at, home.c.zone), zoneOffsetMinutes(at, home.c.zone));
  const dur = useDuration();
  const coord = (v: number, pos: string, neg: string) => `${f.num(Math.abs(Math.round(v * 10) / 10))}°${v >= 0 ? pos : neg}`;
  const live = !pinned && shift === 0;
  // the map is scaled to its card, and its 12px labels grow in map units with it (svgPx): city labels
  // are laid out at that real size so close cities (Riyadh, Dubai, Mumbai) never print over each other
  const [mapRef, k] = useSvgUnitsPerPx(W);
  const fs = 12 * k;
  const subText = `${coord(sub.lat, "N", "S")} ${coord(sub.lon, "E", "W")}`;
  const utcText = `UTC ${f.time(at, "UTC")} · ${f.shortDate(at, "UTC")}`;
  const utcW = labelW(utcText, fs) + 10;
  const utcH = fs * 1.5;
  const spots = placeLabels(
    [
      { x: X(sub.lon), y: Y(sub.lat), lw: labelW(subText, fs), lh: fs * 1.25 },
      ...cities.map(({ c }) => ({ x: X(c.lon), y: Y(c.lat), lw: labelW(`${shortName(f.city(c))} ${f.time(at, c.zone)}`, fs), lh: fs * 1.25 })),
    ],
    W,
    H - utcH - 4,
    9,
  );

  return (
    <SectionCard id="wt-map" title={t("map.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("map.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-full max-w-[720px]">
            <PhoneMini slot={0} title={t("map.title")}>
              <svg ref={mapRef} viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ direction: "ltr" }} className="h-auto w-full max-w-full rounded-lg" role="img" aria-label={t("map.title")}>
                <rect width={W} height={H} className="fill-sky-200 dark:fill-[#0b2447]" />
                <path d={land} className="fill-emerald-100 stroke-emerald-700/40 dark:fill-emerald-900 dark:stroke-emerald-400/30" strokeWidth={0.6} />
                <path d={water} className="fill-sky-200 dark:fill-[#0b2447]" />
                {[-60, -30, 0, 30, 60].map((la) => (
                  <g key={la}>
                    <line x1={0} x2={W} y1={Y(la)} y2={Y(la)} stroke="currentColor" strokeOpacity={la === 0 ? 0.35 : 0.12} />
                    <text style={{ fontSize: svgPx(12) }} x={3} y={Y(la) - 2} className={axisText}>{la === 0 ? "0°" : `${Math.abs(la)}°${la > 0 ? "N" : "S"}`}</text>
                  </g>
                ))}
                {[23.44, -23.44].map((la) => (
                  <line key={la} x1={0} x2={W} y1={Y(la)} y2={Y(la)} stroke="#f59e0b" strokeOpacity={0.45} strokeDasharray="4 4" />
                ))}
                {Array.from({ length: 11 }, (_, i) => -150 + i * 30).map((lo) => (
                  <line key={lo} y1={0} y2={H} x1={X(lo)} x2={X(lo)} stroke="currentColor" strokeOpacity={0.1} />
                ))}
                {bands.map((b) =>
                  b.polygons.map((poly, j) => <path key={`${b.elevationDeg}-${j}`} d={path(poly)} fill="#020617" fillOpacity={0.2} />),
                )}
                {term.map((l, i) => (
                  <path key={i} d={line(l)} fill="none" stroke="#fbbf24" strokeWidth={1.6} />
                ))}
                <line x1={X(sub.lon)} x2={X(sub.lon)} y1={0} y2={H} stroke="#fbbf24" strokeDasharray="2 4" strokeOpacity={0.8} />
                <text style={{ fontSize: svgPx(12) }} x={X(sub.lon) + 4} y={fs + 2} fontWeight={700} fill="#b45309" className="dark:fill-amber-300">12:00 ☀</text>
                <circle cx={X(sub.lon)} cy={Y(sub.lat)} r={16} fill="#fde047" fillOpacity={0.35}>
                  <animate attributeName="r" values="12;18;12" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx={X(sub.lon)} cy={Y(sub.lat)} r={7} fill="#facc15" stroke="#b45309" strokeWidth={1.5} />
                <text style={{ fontSize: svgPx(12) }} x={spots[0].x} y={spots[0].y} textAnchor={spots[0].anchor} fontWeight={700} fill="#b45309" className="dark:fill-amber-300">
                  {subText}
                </text>
                {cities.map(({ c, el }, i) => {
                  const x = X(c.lon);
                  const y = Y(c.lat);
                  const day = el > WT_SUNRISE_ELEVATION;
                  return (
                    <g key={c.id}>
                      <circle cx={x} cy={y} r={i === 0 ? 5.5 : 4} fill={day ? "#fbbf24" : "#93c5fd"} stroke={i === 0 ? "#1d4ed8" : "#0f172a"} strokeWidth={i === 0 ? 2 : 1} />
                      <text style={{ fontSize: svgPx(12) }} x={spots[i + 1].x} y={spots[i + 1].y} textAnchor={spots[i + 1].anchor} fontWeight={i === 0 ? 800 : 600} className={day ? "fill-zinc-900 dark:fill-zinc-100" : "fill-blue-900 dark:fill-sky-200"}>
                        {shortName(f.city(c))} {f.time(at, c.zone)}
                      </text>
                    </g>
                  );
                })}
                <rect x={W - utcW - 4} y={H - utcH - 4} width={utcW} height={utcH} rx={4} fill="#020617" fillOpacity={0.55} />
                <text style={{ fontSize: svgPx(12) }} x={W - 4 - utcW / 2} y={H - 4 - utcH / 2 + fs * 0.35} textAnchor="middle" fontWeight={700} fill="#f8fafc">
                  {utcText}
                </text>
              </svg>
            </PhoneMini>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => { setPinned(false); setPlaying((p) => !p); }} aria-label={playing ? t("map.pause") : t("map.play")} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                {playing ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <input
                type="range"
                min={-720}
                max={720}
                step={10}
                value={shift}
                onChange={(e) => { setPinned(false); setPlaying(false); setShift(Number(e.target.value)); }}
                aria-label={t("map.scrub")}
                className="min-w-[140px] flex-1 accent-blue-600"
                dir="ltr"
              />
              <button type="button" onClick={() => { setPinned(false); setPlaying(false); setShift(0); }} className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold ${live ? "border-emerald-500 text-emerald-700 dark:text-emerald-300" : "border-zinc-300 text-zinc-600 dark:border-zinc-600 dark:text-zinc-300"}`}>
                <Radio size={12} className={live ? "animate-pulse" : ""} />
                {t("map.live")}
              </button>
              <button type="button" onClick={() => { setPlaying(false); setPinned((p) => !p); }} className={`rounded-lg border px-2 py-1 text-xs font-semibold ${pinned ? "border-blue-500 text-blue-700 dark:text-blue-300" : "border-zinc-300 text-zinc-600 dark:border-zinc-600 dark:text-zinc-300"}`}>
                {t("map.converted")}
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {pinned ? t("map.pinnedNote") : shift === 0 ? t("map.liveNote") : t("map.shiftNote", { shift: `${shift > 0 ? "+" : "−"}${dur(Math.abs(shift))}` })}
            </p>
          </div>
        }
        rows={[
          { label: t("map.rowUtc"), value: `${f.time(at, "UTC")} UTC` },
          { label: t("map.rowDecl"), value: `${f.signed(Math.round(sun.declinationDeg * 100) / 100)}°` },
          { label: t("map.rowEot"), value: `${f.signed(Math.round(sun.equationOfTimeMin * 10) / 10)} min` },
          { label: t("map.rowSub"), value: `${coord(sub.lat, "N", "S")}, ${coord(sub.lon, "E", "W")}`, note: t("map.rowSubNote", { eot: f.num(Math.round(sun.equationOfTimeMin * 10) / 10) }) },
          { label: t("map.rowElev", { city: shortName(f.city(home.c)) }), value: `${f.signed(Math.round(home.el * 10) / 10)}°` },
          {
            label: t("map.rowSunTimes", { city: shortName(f.city(home.c)) }),
            value: homeSun.sunrise !== null && homeSun.sunset !== null ? `${f.hhmm(homeSun.sunrise)} – ${f.hhmm(homeSun.sunset)}` : t(homeSun.polar === "day" ? "map.polarDay" : "map.polarNight"),
          },
          { label: t("map.rowLit"), value: `${lit} / ${cities.length}`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 2 · Meeting planner (zone strip heat-map with a draggable slot cursor) */
export function WtMeetingCard({ s, d, f }: CardProps) {
  const t = useIndT();
  const dur = useDuration();
  const [dayShift, setDayShift] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const dragging = useRef(false);

  const date = utcMsToCivil(civilToUtcMs(d.planDate) + dayShift * 86_400_000);
  const plan = useMemo(
    () => (dayShift === 0 ? d.plan : wtPlanMeeting(d.meetingCities, d.from.zone, date, s.ws, s.we)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [d.plan, dayShift, s.ws, s.we],
  );
  const n = plan.slots.length;
  const idx = Math.min(n - 1, sel ?? plan.bestSlots[0] ?? Math.floor(n / 2));
  const slot = plan.slots[idx];
  const LBL = 112;
  // laid out at its on-screen width (true px) so the 12px city names and hours keep their size on a
  // phone: the slots narrow instead, and the hour labels thin out to what fits (§39)
  const [svgRef, room] = useFitWidth(LBL + Math.min(12, 580 / n) * n + 8);
  const CW = Math.min(12, 580 / n, (room - LBL - 8) / n);
  const RH = 24;
  const TOP = 34;
  const W = LBL + n * CW + 8;
  const hourStep = [180, 360, 720].find((m) => (m / plan.stepMinutes) * CW >= labelW("00:00") + 6) ?? 720;
  const H = TOP + (d.all.length + 1) * RH + 18;
  const pick = (e: RPointerEvent<SVGSVGElement>) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * W;
    setSel(Math.max(0, Math.min(n - 1, Math.floor((x - LBL) / CW))));
  };
  const win = plan.bestWindow;
  const fromZone = d.from.zone;
  const slotLabel = (i: number) => f.time(plan.slots[i].utcMs, fromZone);
  const statusT = (st: string) => t(`meet.status.${st}`);

  return (
    <SectionCard id="meeting-planner" title={t("meet.title")}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("meet.intro", { city: f.city(d.from) })}</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => { setDayShift((x) => x - 1); setSel(null); }} aria-label={t("meet.prevDay")} className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-600">
            <ChevronLeft size={14} className="rtl:rotate-180" />
          </button>
          <span className="min-w-[120px] text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100">{f.date(plan.slots[0].utcMs + 3_600_000, fromZone)}</span>
          <button type="button" onClick={() => { setDayShift((x) => x + 1); setSel(null); }} aria-label={t("meet.nextDay")} className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-600">
            <ChevronRight size={14} className="rtl:rotate-180" />
          </button>
        </div>
      </div>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-full max-w-[720px]">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              width={W}
              height={H}
              style={{ direction: "ltr", touchAction: "none" }}
              className="h-auto w-full max-w-full cursor-ew-resize select-none"
              role="img"
              aria-label={t("meet.title")}
              onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); pick(e); }}
              onPointerMove={(e) => dragging.current && pick(e)}
              onPointerUp={() => (dragging.current = false)}
            >
              {plan.slots.map((sl, i) => {
                const m = sl.localMinutes[0];
                return m % hourStep === 0 ? (
                  <text style={{ fontSize: svgPx(12) }} key={i} x={LBL + i * CW} y={TOP - 6} className={axisText}>{f.hhmm(m)}</text>
                ) : null;
              })}
              {d.all.map((c, r) => (
                <g key={c.id}>
                  <text style={{ fontSize: svgPx(12) }} x={LBL - 6} y={TOP + r * RH + RH / 2 + 3} textAnchor="end" fontWeight={r === 0 ? 800 : 600} className={valueText}>
                    {shortName(f.city(c)).slice(0, 15)}
                  </text>
                  {plan.slots.map((sl, i) => (
                    <rect key={i} x={LBL + i * CW + 0.5} y={TOP + r * RH + 2} width={CW - 1} height={RH - 4} rx={1.5} fill={STATUS_COLORS[sl.statuses[r]]} fillOpacity={sl.statuses[r] === "night" ? 0.45 : 0.8} />
                  ))}
                </g>
              ))}
              {plan.slots.map((sl, i) => {
                const h = (sl.available / Math.max(1, d.all.length)) * (RH - 6);
                return <rect key={i} x={LBL + i * CW + 1} y={TOP + d.all.length * RH + RH - 2 - h} width={CW - 2} height={h} fill="#3b82f6" />;
              })}
              <text style={{ fontSize: svgPx(12) }} x={LBL - 6} y={TOP + d.all.length * RH + RH / 2 + 3} textAnchor="end" fontWeight={700} fill="#2563eb">{t("meet.available")}</text>
              {win && (
                <g>
                  <rect x={LBL + win.start * CW - 1} y={TOP - 2} width={(win.end - win.start + 1) * CW + 2} height={d.all.length * RH + RH + 2} fill="none" stroke="#2563eb" strokeWidth={2} rx={3} strokeDasharray="5 3" />
                  <text style={{ fontSize: svgPx(12) }} x={Math.min(LBL + win.start * CW, W - labelW(t("meet.best")) - 2)} y={H - 4} fontWeight={700} fill="#2563eb">{t("meet.best")}</text>
                </g>
              )}
              <rect x={LBL + idx * CW} y={TOP - 4} width={CW} height={d.all.length * RH + RH + 4} fill="none" stroke="currentColor" strokeWidth={2} className="text-zinc-900 dark:text-white" style={{ transition: "x 120ms ease" }} />
              <text style={{ fontSize: svgPx(12) }} x={Math.min(W - 40, LBL + idx * CW + CW / 2)} y={10} textAnchor="middle" fontWeight={800} className={valueText}>{slotLabel(idx)}</text>
            </svg>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-600 dark:text-zinc-300">
              {(["work", "shoulder", "night", "weekend"] as const).map((k) => (
                <span key={k} className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: STATUS_COLORS[k] }} />
                  {statusT(k)}
                </span>
              ))}
              <span className="text-zinc-400">{t("meet.dragHint")}</span>
            </div>
          </div>
        }
        rows={[
          { label: t("meet.rowSlot", { city: shortName(f.city(d.from)) }), value: `${slotLabel(idx)}–${f.time(slot.utcMs + plan.stepMinutes * 60_000, fromZone)}` },
          ...d.all.slice(1).map((c, i) => ({
            label: shortName(f.city(c)),
            value: `${f.time(slot.utcMs, c.zone)} · ${statusT(slot.statuses[i + 1])}`,
          })),
          { label: t("meet.rowAvail"), value: `${slot.available} / ${d.all.length}` },
          {
            label: t("meet.rowBest"),
            value: win ? `${slotLabel(win.start)}–${f.time(plan.slots[win.end].utcMs + plan.stepMinutes * 60_000, fromZone)}` : t("meet.none"),
            note: win ? t("meet.rowBestNote", { n: plan.maxAvailable, total: d.all.length, dur: dur((win.end - win.start + 1) * plan.stepMinutes) }) : undefined,
            emphasize: true,
          },
        ]}
      />
    </SectionCard>
  );
}

/* 3 · Shared working hours with the home city (ranked horizontal bars) */
export function WtOverlapBarsCard({ s, d, f }: CardProps) {
  const t = useIndT();
  const dur = useDuration();
  const plan = d.plan;
  const span = s.we - s.ws;
  const winOf = (j: number) => {
    const hits = plan.slots.map((sl, i) => (sl.statuses[0] === "work" && sl.statuses[j] === "work" ? i : -1)).filter((i) => i >= 0);
    return hits.length ? [hits[0], hits[hits.length - 1]] : null;
  };
  const rows = d.all
    .slice(1)
    .map((c, k) => ({ c, j: k + 1, min: wtPairOverlapMinutes(plan, 0, k + 1), win: winOf(k + 1) }))
    .sort((a, b) => b.min - a.min);
  const all = { min: plan.allOverlapMinutes };
  const [fitRef, W] = useFitWidth(460);
  const RH = 28;
  const L = 118;
  const H = (rows.length + 1) * RH + 10;
  const bar = (min: number) => Math.max(2, (min / Math.max(30, span)) * (W - L - 70));
  const fz = d.from.zone;
  const fmtWin = (w: number[] | null) => (w ? `${f.time(plan.slots[w[0]].utcMs, fz)}–${f.time(plan.slots[w[1]].utcMs + plan.stepMinutes * 60_000, fz)}` : t("meet.none"));

  return (
    <SectionCard title={t("overlap.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("overlap.intro", { city: f.city(d.from), date: f.date(plan.slots[0].utcMs + 3_600_000, fz) })}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg viewBox={`0 0 ${W} ${H}`} ref={fitRef} width={W} height={H} style={{ direction: "ltr" }} className="h-auto max-w-full" role="img" aria-label={t("overlap.title")}>
            {[{ label: t("overlap.allCities"), min: all.min, all: true }, ...rows.map((r) => ({ label: shortName(f.city(r.c)), min: r.min, all: false }))].map((r, i) => (
              <g key={i}>
                <text style={{ fontSize: svgPx(12) }} x={L - 6} y={i * RH + 19} textAnchor="end" fontWeight={r.all ? 800 : 600} className={r.all ? "fill-blue-700 dark:fill-blue-300" : valueText}>{r.label}</text>
                <rect x={L} y={i * RH + 6} width={W - L - 70} height={RH - 10} rx={4} className="fill-zinc-100 dark:fill-zinc-800" />
                <rect x={L} y={i * RH + 6} width={bar(r.min)} height={RH - 10} rx={4} fill={r.all ? "#2563eb" : r.min === 0 ? "#f43f5e" : "#10b981"} style={{ transition: "width 400ms ease" }} />
                <text style={{ fontSize: svgPx(12) }} x={L + bar(r.min) + 5} y={i * RH + 19} fontWeight={700} className={valueText}>{dur(r.min)}</text>
              </g>
            ))}
          </svg>
        }
        rows={[
          { label: t("overlap.rowWork", { city: shortName(f.city(d.from)) }), value: `${f.hhmm(s.ws)}–${s.we === 1440 ? "24:00" : f.hhmm(s.we)}`, note: dur(span) },
          ...rows.slice(0, 5).map((r) => ({ label: shortName(f.city(r.c)), value: fmtWin(r.win), note: dur(r.min) })),
          { label: t("overlap.allCities"), value: dur(all.min), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 4 · UTC offsets now: standard time + DST (labeled stacked bars) */
export function WtOffsetBarsCard({ d, f }: CardProps) {
  const t = useIndT();
  const tu = useUnitT();
  const items = d.all.map((c, i) => ({ c, off: d.conv.rows[i].offsetMinutes, std: d.extra[i].std.standard })).sort((a, b) => a.off - b.off);
  const [fitRef, W] = useFitWidth(470);
  const H = 250;
  const T = 18;
  // city names turned 55°: steep enough that neighbouring names on a narrow card do not touch (§39)
  const B = 72;
  const lo = Math.min(-2, Math.floor(Math.min(...items.map((x) => x.off)) / 60) - 1);
  const hi = Math.max(2, Math.ceil(Math.max(...items.map((x) => x.off)) / 60) + 1);
  const y = (h: number) => T + ((hi - h) / (hi - lo)) * (H - T - B);
  const L = 30;
  const bw = Math.min(34, (W - L - 10) / items.length - 8);
  const x = (i: number) => L + 8 + i * ((W - L - 10) / items.length);
  const ticks = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter((h) => (hi - lo > 14 ? h % 3 === 0 : h % 2 === 0));
  const first = items[0];
  const last = items[items.length - 1];
  const home = d.all[0];
  const hx = d.extra[0];

  return (
    <SectionCard title={t("offsets.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("offsets.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <PhoneMini slot={1} title={t("offsets.title")}>
            <svg viewBox={`0 0 ${W} ${H}`} ref={fitRef} width={W} height={H} style={{ direction: "ltr" }} className="h-auto max-w-full" role="img" aria-label={t("offsets.title")}>
              {ticks.map((h) => (
                <g key={h}>
                  <line x1={L} x2={W} y1={y(h)} y2={y(h)} stroke="currentColor" strokeOpacity={h === 0 ? 0.5 : 0.1} />
                  <text style={{ fontSize: svgPx(12) }} x={L - 4} y={y(h) + 3} textAnchor="end" className={axisText}>{h > 0 ? `+${h}` : h}</text>
                </g>
              ))}
              {items.map((it, i) => {
                const stdH = it.std / 60;
                const offH = it.off / 60;
                const cx = x(i) + bw / 2;
                return (
                  <g key={it.c.id} style={{ transition: "all 400ms ease" }}>
                    <rect x={x(i)} y={Math.min(y(0), y(stdH))} width={bw} height={Math.abs(y(stdH) - y(0))} rx={2} fill="#3b82f6" />
                    {it.off !== it.std && <rect x={x(i)} y={Math.min(y(stdH), y(offH))} width={bw} height={Math.abs(y(offH) - y(stdH))} rx={2} fill="#f59e0b" />}
                    <text style={{ fontSize: svgPx(12) }} x={cx} y={offH >= 0 ? y(offH) - 4 : y(offH) + 11} textAnchor="middle" fontWeight={700} className={valueText}>{f.offset(it.off).replace("UTC", "")}</text>
                    <text style={{ fontSize: svgPx(12) }} x={cx} y={H - B + 12} textAnchor="end" transform={`rotate(-55 ${cx} ${H - B + 12})`} className={valueText}>{shortName(f.city(it.c)).slice(0, 13)}</text>
                  </g>
                );
              })}
              <rect x={W - 150} y={4} width={9} height={9} fill="#3b82f6" />
              <text style={{ fontSize: svgPx(12) }} x={W - 138} y={12} className={axisText}>{t("offsets.std")}</text>
              <rect x={W - 80} y={4} width={9} height={9} fill="#f59e0b" />
              <text style={{ fontSize: svgPx(12) }} x={W - 68} y={12} className={axisText}>{t("offsets.dst")}</text>
            </svg>
          </PhoneMini>
        }
        rows={[
          { label: t("offsets.rowEarliest"), value: `${shortName(f.city(first.c))} ${f.offset(first.off)}` },
          { label: t("offsets.rowLatest"), value: `${shortName(f.city(last.c))} ${f.offset(last.off)}` },
          { label: t("offsets.rowSpan"), value: tu("h", { n: f.num((last.off - first.off) / 60) }), note: `${f.offset(last.off)} − (${f.offset(first.off)})` },
          {
            label: t("offsets.rowHome", { city: shortName(f.city(home)) }),
            value: f.offset(d.conv.rows[0].offsetMinutes),
            note: `${f.offset(hx.std.standard)} + ${f.hhmm(d.conv.rows[0].offsetMinutes - hx.std.standard)}`,
            emphasize: true,
          },
          { label: t("offsets.rowDstCount"), value: `${items.filter((it) => it.off !== it.std).length} / ${items.length}` },
        ]}
      />
    </SectionCard>
  );
}
