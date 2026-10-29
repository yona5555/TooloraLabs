"use client";
import { useTranslations } from "next-intl";
import { wtSolarElevation, wtSolarPosition, type WtCity } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import { STATUS_COLORS, type Derived, type Fmt, type WtState } from "./state";
import { px2 } from "@/components/tool-ui/indicator-kit/SvgBits";
import { svgPx } from "@/components/tool-ui/svgPx";
import { useSvgUnitsPerPx } from "@/components/tool-ui/useFitWidth";
import { labelW, placeLabels } from "@/components/tool-ui/labelLayout";

import FitSvg from "@/components/tool-ui/FitSvg";
type Props = { s: WtState; d: Derived; f: Fmt };

const RING_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#14b8a6", "#6366f1"];

/** 24-hour dial: one ring per city, the dot at its local time; work hours and night shaded. */
function Dial({ s, d, f }: Props) {
  const S = 320;
  const c = S / 2;
  const n = d.all.length;
  const outer = 132;
  const inner = 46;
  const gap = n > 1 ? (outer - inner) / (n - 1) : 0;
  const sun = wtSolarPosition(d.conv.utcMs);
  const sub = { lat: sun.subsolarLatDeg, lon: sun.subsolarLonDeg };
  const ang = (min: number) => (min / 1440) * 2 * Math.PI - Math.PI / 2;
  // Rounded: server and browser trig differ in the last digits, which broke hydration.
  const pt = (min: number, r: number) => [px2(c + r * Math.cos(ang(min))), px2(c + r * Math.sin(ang(min)))] as const;
  const arc = (a: number, b: number, r0: number, r1: number) => {
    const large = (b - a + 1440) % 1440 > 720 ? 1 : 0;
    const [x0, y0] = pt(a, r1);
    const [x1, y1] = pt(b, r1);
    const [x2, y2] = pt(b, r0);
    const [x3, y3] = pt(a, r0);
    return `M${x0},${y0} A${r1},${r1} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 0 ${x3},${y3} Z`;
  };
  const r = (i: number) => outer - i * gap;
  // city labels at their rendered size (the dial is scaled to its box): two cities an hour or so apart
  // take different lines instead of printing over each other (§39)
  const [dialRef, k] = useSvgUnitsPerPx(S);
  const fs = 12 * k;
  const label = (city: WtCity) => `${f.city(city).split(" / ")[0].slice(0, 12)} ${f.time(d.conv.utcMs, city.zone)}`;
  const spots = placeLabels(
    d.all.map((city, i) => {
      const m = d.conv.rows[i].parts.hour * 60 + d.conv.rows[i].parts.minute;
      const [x, y] = pt(m, r(i));
      return { x, y, lw: labelW(label(city), fs), lh: fs * 1.25, side: Math.cos(ang(m)) >= 0 ? ("start" as const) : ("end" as const) };
    }),
    S,
    S,
    7,
    // the UTC clock in the centre
    [{ a: c - (inner - 14), b: c + (inner - 14), t: c - (inner - 14), u: c + (inner - 14) }],
  );

  return (
    <FitSvg ref={dialRef} viewBox={`0 0 ${S} ${S}`} width="100%" height="100%" overflow="visible" style={{ direction: "ltr" }} role="img" aria-label="24h dial">
      <circle cx={c} cy={c} r={outer + 18} className="fill-zinc-50 dark:fill-zinc-800/60" />
      <path d={arc(22 * 60, 7 * 60, inner - 10, outer + 8)} fill={STATUS_COLORS.night} fillOpacity={0.18} />
      <path d={arc(s.ws, s.we % 1440 === s.ws ? s.ws + 1439 : s.we, inner - 10, outer + 8)} fill={STATUS_COLORS.work} fillOpacity={0.2} />
      {Array.from({ length: 24 }, (_, h) => {
        const [x0, y0] = pt(h * 60, outer + 10);
        const [x1, y1] = pt(h * 60, outer + (h % 3 === 0 ? 16 : 13));
        const [tx, ty] = pt(h * 60, outer + 24);
        return (
          <g key={h}>
            <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="currentColor" strokeOpacity={0.45} />
            {h % 3 === 0 && (
              <text style={{ fontSize: svgPx(12) }} x={tx} y={ty + 3} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
                {String(h).padStart(2, "0")}
              </text>
            )}
          </g>
        );
      })}
      {d.all.map((city: WtCity, i) => {
        const row = d.conv.rows[i];
        const m = row.parts.hour * 60 + row.parts.minute;
        const [x, y] = pt(m, r(i));
        const el = wtSolarElevation({ lat: city.lat, lon: city.lon }, sub);
        const col = RING_COLORS[i % RING_COLORS.length];
        return (
          <g key={city.id} style={{ transition: "all 400ms ease" }}>
            <circle cx={c} cy={c} r={r(i)} fill="none" stroke={col} strokeOpacity={0.25} strokeWidth={1} />
            <line x1={c} y1={c} x2={x} y2={y} stroke={col} strokeOpacity={i === 0 ? 0.9 : 0.35} strokeWidth={i === 0 ? 2.5 : 1} />
            <circle cx={x} cy={y} r={i === 0 ? 6 : 4.5} fill={el > -0.833 ? "#fbbf24" : "#1e3a8a"} stroke={col} strokeWidth={2} />
            <text style={{ fontSize: svgPx(12) }} x={spots[i].x} y={spots[i].y} textAnchor={spots[i].anchor} fontWeight={i === 0 ? 800 : 600} fill={col}>
              {label(city)}
            </text>
          </g>
        );
      })}
      <circle cx={c} cy={c} r={inner - 14} className="fill-white dark:fill-zinc-900" stroke="currentColor" strokeOpacity={0.2} />
      <text style={{ fontSize: svgPx(13) }} x={c} y={c - 2} textAnchor="middle" fontWeight={800} className="fill-zinc-800 dark:fill-zinc-100">
        {f.time(d.conv.utcMs, "UTC")}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={c} y={c + 11} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">UTC</text>
    </FitSvg>
  );
}

export default function WorldTimeResult({ s, d, f }: Props) {
  const t = useTranslations("tools.world-time-converter.wt.result");
  const tu = useTranslations("tools.world-time-converter.wt.units");
  const ms = d.conv.utcMs;
  const utcH = f.time(ms, "UTC");

  const groups: LiveTableGroup[] = d.all.map((c, i) => {
    const row = d.conv.rows[i];
    const x = d.extra[i];
    const dst = row.offsetMinutes - x.std.standard;
    const next = x.next;
    return {
      title: `${i === 0 ? "⌂ " : ""}${f.city(c)} — ${f.country(c)}`,
      rows: [
        { label: t("localTime"), formula: `UTC ${utcH} ${row.offsetMinutes < 0 ? "−" : "+"} ${f.hhmm(Math.abs(row.offsetMinutes))}`, value: f.time(ms, c.zone), emphasize: true },
        {
          label: t("date"),
          formula: row.dayDelta === 0 ? t("sameDay") : row.dayDelta > 0 ? t("nextDay", { n: row.dayDelta }) : t("prevDay", { n: -row.dayDelta }),
          value: f.date(ms, c.zone),
        },
        {
          label: t("offset"),
          formula: dst ? t("offsetDst", { std: f.offset(x.std.standard), dst: f.hhmm(dst) }) : t("offsetStd", { std: f.offset(x.std.standard) }),
          value: f.offset(row.offsetMinutes),
        },
        { label: t("hijri"), formula: t("ummAlQura"), value: f.hijri(ms, c.zone) },
        {
          label: t("nextChange"),
          formula: next ? `${f.offset(next.offsetBefore)} → ${f.offset(next.offsetAfter)}` : t("noDstFormula"),
          value: next ? `${f.shortDate(next.utcMs, c.zone)} (${tu("h", { n: f.signed((next.offsetAfter - next.offsetBefore) / 60) })})` : t("noDst"),
        },
      ],
    };
  });

  return (
    <SectionCard phoneRole="output" title={t("title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="p-3 lg:flex lg:flex-1 lg:flex-col">
      <div className="mb-3 grid grid-cols-3 gap-2 text-center" data-bp-inner>
        {[
          { k: f.city(d.from), v: f.time(ms, d.from.zone) },
          { k: t("utc"), v: utcH },
          { k: t("spread"), v: tu("h", { n: f.num(d.spread / 60) }) },
        ].map((x) => (
          <div key={x.k} className="rounded-lg bg-blue-50 px-1 py-1.5 dark:bg-blue-500/10">
            <p className="truncate text-xs leading-3 font-semibold text-zinc-500 dark:text-zinc-400">{x.k}</p>
            <p dir="ltr" className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{x.v}</p>
          </div>
        ))}
      </div>
      <p className="mb-2 text-center text-xs text-zinc-600 dark:text-zinc-300">
        {s.mode === "now" ? t("liveNote", { date: f.date(ms, d.from.zone) }) : t("customNote", { date: f.date(ms, d.from.zone), city: f.city(d.from) })}
      </p>
      <LiveTableFill>
        <LiveTable3DLayout
          headings={[t("colItem"), t("colCalc"), t("colValue")]}
          groups={groups}
          drawing={<Dial s={s} d={d} f={f} />}
          caption={t("dialCaption", { start: f.hhmm(s.ws), end: s.we === 1440 ? "24:00" : f.hhmm(s.we) })}
        />
      </LiveTableFill>
    </SectionCard>
  );
}
