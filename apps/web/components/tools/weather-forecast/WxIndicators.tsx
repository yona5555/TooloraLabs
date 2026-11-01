"use client";
import { useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import {
  beaufort,
  celsiusToFahrenheit,
  dewPointC,
  compass16,
  DEW_COMFORT_BANDS,
  dewComfort,
  feelsLike,
  isNightSymbol,
  metSymbolCategory,
  MOON_PHASES,
  UV_BANDS,
  uvLevel,
  weatherPrecip,
  weatherPressure,
  weatherTemp,
  weatherWind,
} from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WxSplit, { type WxRow } from "./WxSplit";
import WeatherIcon from "./WeatherIcon";
import { moonPath } from "./WxSkyScene";
import { dateKeyMs, tempColor, useChartWidth, useIsRtl, useWxT, type WxCardProps } from "./wx";
import { svgPx } from "@/components/tool-ui/svgPx";
import { inkOn, paletteTextClass } from "@/lib/palette-text";

import FitSvg from "@/components/tool-ui/FitSvg";
const axis = "fill-zinc-500 dark:fill-zinc-400";
const strong = "fill-zinc-800 dark:fill-zinc-100";
const grid = "stroke-zinc-200 dark:stroke-zinc-700";

function Intro({ text }: { text: string }) {
  return <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{text}</p>;
}

/* 1 · Hourly 48 h: temperature + feels-like lines, precipitation bars, hover/drag hour cursor (mirrored in RTL) */
export function WxHourlyCard({ d, f }: WxCardProps) {
  const t = useWxT();
  const rtl = useIsRtl();
  const hours = d.hours48;
  const [sel, setSel] = useState(0);
  const [wrap, W] = useChartWidth(640);
  if (hours.length === 0) return null;
  const H = 280;
  const PL = 40;
  const PR = 40;
  const T = 22;
  const B = 40;
  const n = hours.length;
  const feels = hours.map((h) => feelsLike(h.tempC, h.rh, h.windKmh).valueC);
  const temps = hours.map((h) => weatherTemp(h.tempC, f.units));
  const fl = feels.map((v) => weatherTemp(v, f.units));
  const lo = Math.floor(Math.min(...temps, ...fl) - 1);
  const hi = Math.ceil(Math.max(...temps, ...fl) + 1);
  const pMax = Math.max(1, ...hours.map((h) => h.precipMm));
  const span = W - PL - PR;
  const X = (i: number) => {
    const frac = i / Math.max(1, n - 1);
    return rtl ? W - PR - frac * span : PL + frac * span;
  };
  const Y = (v: number) => T + ((hi - v) / (hi - lo)) * (H - T - B);
  const P = (mm: number) => (mm / pMax) * 60;
  // Temperature axis at the start side, precipitation axis at the end side.
  const tempAxisX = rtl ? W - PR + 4 : PL - 4;
  const tempAnchor = rtl ? "start" : "end";
  const precipAxisX = rtl ? PL - 4 : W - PR + 4;
  const precipAnchor = rtl ? "end" : "start";
  const line = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join("");
  const i = Math.min(sel, n - 1);
  const h = hours[i];
  const fx = feelsLike(h.tempC, h.rh, h.windKmh);
  const dew = h.dewC ?? dewPointC(h.tempC, h.rh);
  const pick = (e: RPointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    let frac = (x - PL) / span;
    if (rtl) frac = 1 - frac;
    setSel(Math.max(0, Math.min(n - 1, Math.round(frac * (n - 1)))));
  };
  const n1 = (v: number) => f.num(v, 1);
  const tf = celsiusToFahrenheit(h.tempC);
  const worked =
    fx.method === "windChill"
      ? `13.12 + 0.6215×${n1(h.tempC)} − 11.37×${n1(h.windKmh)}^0.16 + 0.3965×${n1(h.tempC)}×${n1(h.windKmh)}^0.16 = ${n1(fx.valueC)} °C`
      : fx.method === "heatIndex"
        ? `HI(T = ${n1(tf)} °F, RH = ${f.num(h.rh)}%) = ${n1(celsiusToFahrenheit(fx.valueC))} °F = ${n1(fx.valueC)} °C`
        : `T = ${n1(h.tempC)} °C, V = ${n1(h.windKmh)} km/h → (T > 10 °C or V ≤ 4.8) & T < 26.7 °C → ${n1(h.tempC)} °C`;
  const half = span / (2 * Math.max(1, n - 1));
  const ticks = 5;
  const rows: WxRow[] = [
    { label: t("ind.hourly.time"), value: `${f.weekday(h.t, d.place.zone)} ${f.time(h.t, d.place.zone)}` },
    { label: t("result.condition"), value: t(`category.${metSymbolCategory(h.symbol)}`) },
    { label: t("result.temp"), value: f.temp(h.tempC, 1) },
    { label: t("result.feels"), value: f.temp(fx.valueC, 1), emphasize: true },
    { label: t("result.dew"), value: f.temp(dew, 1) },
    { label: t("result.humidity"), value: `${f.num(h.rh)}%` },
    { label: t("result.wind"), value: `${f.wind(h.windKmh)} · ${t(`compass.${compass16(h.windDir)}`)}` },
    ...(h.gustKmh !== null ? [{ label: t("result.gust"), value: f.wind(h.gustKmh) }] : []),
    { label: t("result.pressure"), value: f.pressure(h.pressureHpa) },
    { label: t("result.cloud"), value: `${f.num(h.cloud)}%` },
    { label: t("ind.hourly.precipRow"), value: f.precip(h.precipMm) },
    ...(h.uv !== null ? [{ label: t("result.uv"), value: `${f.num(h.uv, 1)} · ${t(`uv.${uvLevel(h.uv)}`)}` }] : []),
    { label: t("ind.hourly.method"), value: t(`ind.method.${fx.method}`) },
    { label: t("ind.hourly.formula"), value: worked, wide: true },
  ];
  return (
    <SectionCard id="wx-hourly" title={t("ind.hourly.title")} phoneRole="extra">
      <Intro text={t("ind.hourly.intro")} />
      <WxSplit
        layout="stacked"
        title={t("ind.worked")}
        rows={rows}
        chart={
          <div ref={wrap} className="w-full">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width={W}
              height={H}
              style={{ direction: "ltr", touchAction: "none" }}
              className="h-auto w-full max-w-full cursor-ew-resize select-none"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                pick(e);
              }}
              onPointerMove={pick}
              role="img"
              aria-label={t("ind.hourly.title")}
            >
              {hours.map((x, k) =>
                isNightSymbol(x.symbol) ? <rect key={k} x={X(k) - half} y={T} width={half * 2} height={H - T - B} className="fill-indigo-900/10 dark:fill-indigo-300/10" /> : null,
              )}
              {Array.from({ length: ticks + 1 }, (_, k) => lo + ((hi - lo) * k) / ticks).map((v) => (
                <g key={v}>
                  <line x1={PL} x2={W - PR} y1={Y(v)} y2={Y(v)} className={grid} />
                  <text style={{ fontSize: svgPx(12) }} x={tempAxisX} y={Y(v) + 3} textAnchor={tempAnchor} className={axis}>{f.num(v)}°</text>
                </g>
              ))}
              {[0, 0.5, 1].map((k) => (
                <text style={{ fontSize: svgPx(12) }} key={k} x={precipAxisX} y={H - B - P(pMax * k) + 3} textAnchor={precipAnchor} className="fill-sky-600 dark:fill-sky-400">{f.num(weatherPrecip(pMax * k, f.units), 1)}</text>
              ))}
              {hours.map((x, k) => (
                <rect key={k} x={X(k) - 4} y={H - B - P(x.precipMm)} width={8} height={P(x.precipMm)} className="fill-sky-500/60" />
              ))}
              <path d={line(fl)} fill="none" stroke="#a855f7" strokeWidth={1.6} strokeDasharray="5 4" />
              <path d={line(temps)} fill="none" stroke="#f97316" strokeWidth={2.6} strokeLinejoin="round" />
              {hours.map((x, k) =>
                k % 6 === 0 ? (
                  <text style={{ fontSize: svgPx(12) }} key={k} x={X(k)} y={H - B + 17} textAnchor="middle" className={axis}>{f.hour(x.t, d.place.zone)}</text>
                ) : null,
              )}
              {hours.map((x, k) =>
                k > 0 && f.hour(x.t, d.place.zone) === "00" ? (
                  <g key={`d${k}`}>
                    <line x1={X(k)} x2={X(k)} y1={T} y2={H - B} stroke="currentColor" strokeOpacity={0.3} strokeDasharray="2 3" />
                    <text style={{ fontSize: svgPx(12) }} x={X(k) + (rtl ? -3 : 3)} y={H - 5} textAnchor={rtl ? "end" : "start"} fontWeight={700} className={strong}>{f.weekday(x.t, d.place.zone)}</text>
                  </g>
                ) : null,
              )}
              <line x1={X(i)} x2={X(i)} y1={T} y2={H - B} stroke="#2563eb" strokeWidth={1.5} />
              <circle cx={X(i)} cy={Y(temps[i])} r={5} fill="#2563eb" stroke="#fff" strokeWidth={1.5} />
              <circle cx={X(i)} cy={Y(fl[i])} r={3.5} fill="#a855f7" />
              <rect x={Math.min(W - PR - 104, Math.max(PL, X(i) - 52))} y={T - 18} width={104} height={20} rx={4} fill="#1d4ed8" />
              <text style={{ fontSize: svgPx(12) }} x={Math.min(W - PR - 52, Math.max(PL + 52, X(i)))} y={T - 4} textAnchor="middle" fontWeight={700} fill="#fff">
                {f.hour(h.t, d.place.zone)}:00 · {f.deg(h.tempC)}
              </text>
            </svg>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-600 dark:text-zinc-300">
              <span className="flex items-center gap-1"><span className="h-0.5 w-4 bg-orange-500" />{t("ind.hourly.temp")}</span>
              <span className="flex items-center gap-1"><span className="h-0.5 w-4 border-t-2 border-dashed border-purple-500" />{t("ind.hourly.feels")}</span>
              <span className="flex items-center gap-1"><span className="h-2 w-3 bg-sky-500/60" />{t("ind.hourly.precip", { unit: f.precipUnit })}</span>
              <span className="flex items-center gap-1"><span className="h-2 w-3 bg-indigo-900/20 dark:bg-indigo-300/20" />{t("ind.hourly.night")}</span>
              <span className="text-zinc-500">{t("ind.hourly.drag")}</span>
            </div>
          </div>
        }
      />
    </SectionCard>
  );
}

/* 2 · 7–10 day outlook: min/max range bars on one shared scale + precipitation */
export function WxDailyCard({ d, f }: WxCardProps) {
  const t = useWxT();
  // The approved card shows 10 days; the feed sometimes adds an 11th, which unbalances it.
  const days = d.days.slice(0, 10);
  const [sel, setSel] = useState(0);
  const lo = Math.min(...days.map((x) => x.minC));
  const hi = Math.max(...days.map((x) => x.maxC));
  const pMax = Math.max(1, ...days.map((x) => x.precipMm));
  const pct = (c: number) => ((c - lo) / Math.max(1, hi - lo)) * 100;
  const day = days[Math.min(sel, days.length - 1)];
  if (!day) return null;
  return (
    <SectionCard id="wx-daily" title={t("ind.daily.title", { n: days.length })}>
      <Intro text={t("ind.daily.intro")} />
      <WxSplit
        layout="side"
        title={t("ind.worked")}
        chart={
          <ul className="w-full max-w-[640px] space-y-1" style={{ minWidth: "min(100%, 520px)" }}>
            {days.map((x, k) => {
              const ms = dateKeyMs(x.date);
              return (
                <li key={x.date}>
                  <button
                    type="button"
                    onClick={() => setSel(k)}
                    aria-pressed={sel === k}
                    className={`grid w-full grid-cols-[52px_22px_40px_minmax(0,1fr)_40px_58px] items-center gap-1.5 rounded-lg sm:grid-cols-[64px_26px_44px_1fr_44px_70px] sm:gap-2 px-2 py-1.5 text-sm ${sel === k ? "bg-blue-50 ring-1 ring-blue-400 dark:bg-blue-500/10" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"}`}
                  >
                    <span className="text-start font-semibold text-zinc-800 dark:text-zinc-100">{k === 0 ? t("ind.daily.today") : f.weekday(ms, "UTC")}</span>
                    <WeatherIcon category={x.category} size={20} className="text-amber-500" />
                    <span dir="ltr" className="text-end text-zinc-500 dark:text-zinc-400">{f.deg(x.minC)}</span>
                    <span dir="ltr" className="relative h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <span
                        className="absolute inset-y-0 rounded-full transition-all duration-500"
                        style={{ left: `${pct(x.minC)}%`, width: `${Math.max(2, pct(x.maxC) - pct(x.minC))}%`, background: `linear-gradient(90deg, ${tempColor(x.minC)}, ${tempColor(x.maxC)})` }}
                      />
                    </span>
                    <span dir="ltr" className="font-bold text-zinc-900 dark:text-zinc-50">{f.deg(x.maxC)}</span>
                    <span dir="ltr" className="flex items-center gap-1">
                      <span className="h-2 rounded-sm bg-sky-500" style={{ width: `${(x.precipMm / pMax) * 36 + 2}px` }} />
                      <span className="text-xs text-sky-700 dark:text-sky-300">{f.num(weatherPrecip(x.precipMm, f.units), 1)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            <li className="px-2 pt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("ind.daily.legend", { unit: f.precipUnit })}</li>
          </ul>
        }
        rows={[
          { label: t("ind.daily.day"), value: `${f.weekday(dateKeyMs(day.date), "UTC")} ${f.dayMonth(dateKeyMs(day.date), "UTC")}` },
          { label: t("ind.daily.high"), value: f.temp(day.maxC, 1) },
          { label: t("ind.daily.low"), value: f.temp(day.minC, 1) },
          { label: t("ind.daily.range"), value: `${f.num(weatherTemp(day.maxC, f.units) - weatherTemp(day.minC, f.units), 1)}°` },
          { label: t("ind.daily.precip"), value: f.precip(day.precipMm), emphasize: true },
          { label: t("ind.daily.windMax"), value: f.wind(day.windMaxKmh) },
          { label: t("result.uv"), value: day.uvMax !== null ? `${f.num(day.uvMax, 1)} · ${t(`uv.${uvLevel(day.uvMax)}`)}` : t("result.notProvided") },
          { label: t("ind.daily.coverage"), value: t("units.h", { n: day.coveredHours }) },
        ]}
      />
    </SectionCard>
  );
}

/* 3 · Wind compass (animated) + Beaufort force */
export function WxWindCard({ d, f }: WxCardProps) {
  const t = useWxT();
  const cur = d.cur!;
  const ms = cur.windKmh / 3.6;
  const bf = beaufort(ms);
  const dir = compass16(cur.windDir);
  const max24 = d.hours48.slice(0, 24).reduce((a, h) => (h.windKmh > a.windKmh ? h : a), d.hours48[0] ?? cur);
  const S = 240;
  const c = S / 2;
  const r = 92;
  const to = cur.windDir + 180;
  const dur = `${Math.max(0.6, 3 - ms / 6).toFixed(2)}s`;
  return (
    <SectionCard id="wx-wind" title={t("ind.wind.title")}>
      <Intro text={t("ind.wind.intro")} />
      <WxSplit
        layout="side"
        title={t("ind.worked")}
        chart={
          <div className="flex flex-col items-center gap-2">
            <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S} style={{ direction: "ltr" }} role="img" aria-label={t("ind.wind.title")}>
              <circle cx={c} cy={c} r={r + 16} className="fill-sky-50 dark:fill-sky-500/10" />
              <circle cx={c} cy={c} r={r} fill="none" className="stroke-zinc-300 dark:stroke-zinc-600" />
              {Array.from({ length: 16 }, (_, k) => {
                const a = ((k * 22.5 - 90) * Math.PI) / 180;
                const major = k % 4 === 0;
                return (
                  <g key={k}>
                    <line x1={c + Math.cos(a) * (r - (major ? 10 : 5))} y1={c + Math.sin(a) * (r - (major ? 10 : 5))} x2={c + Math.cos(a) * r} y2={c + Math.sin(a) * r} stroke="currentColor" strokeOpacity={0.5} />
                    {major && (
                      <text style={{ fontSize: svgPx(12) }} x={c + Math.cos(a) * (r + 9)} y={c + Math.sin(a) * (r + 9) + 4} textAnchor="middle" fontWeight={700} className={strong}>
                        {["N", "E", "S", "W"][k / 4]}
                      </text>
                    )}
                  </g>
                );
              })}
              <g transform={`rotate(${to} ${c} ${c})`} style={{ transition: "transform 800ms ease" }}>
                {[-18, 0, 18].map((dx) => (
                  <line key={dx} x1={c + dx} x2={c + dx} y1={c + 50} y2={c + 30} stroke="#38bdf8" strokeWidth={2} strokeLinecap="round" opacity={0.7}>
                    <animateTransform attributeName="transform" type="translate" values="0,0;0,-70" dur={dur} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;0.8;0" dur={dur} repeatCount="indefinite" />
                  </line>
                ))}
                <path d={`M${c},${c - r + 14} L${c + 9},${c - r + 34} L${c + 3},${c - r + 34} L${c + 3},${c + 36} L${c - 3},${c + 36} L${c - 3},${c - r + 34} L${c - 9},${c - r + 34}Z`} fill="#2563eb" />
              </g>
              <circle cx={c} cy={c} r={26} className="fill-white dark:fill-zinc-900" stroke="#2563eb" strokeWidth={2} />
              <text style={{ fontSize: svgPx(15) }} x={c} y={c + 2} textAnchor="middle" fontWeight={800} className={strong}>{f.num(weatherWind(cur.windKmh, f.units))}</text>
              <text style={{ fontSize: svgPx(12) }} x={c} y={c + 14} textAnchor="middle" className={axis}>{f.windUnit}</text>
            </svg>
            <div dir="ltr" className="flex gap-0.5" aria-label={t("result.beaufort")}>
              {Array.from({ length: 13 }, (_, k) => (
                <span key={k} className={`flex h-6 w-5 items-center justify-center rounded text-xs font-bold ${k === bf ? "bg-blue-600 text-white" : k < bf ? "bg-sky-200 text-sky-900 dark:bg-sky-500/30 dark:text-sky-100" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"}`}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        }
        rows={[
          { label: t("ind.wind.raw"), value: `${f.num(ms, 1)} m/s` },
          { label: t("ind.wind.convert"), value: `${f.num(ms, 1)} × 3.6 = ${f.num(cur.windKmh, 1)} km/h` },
          { label: t("ind.wind.from"), value: `${f.num(cur.windDir)}° → ${t(`compass.${dir}`)}` },
          { label: t("ind.wind.sector"), value: `round(${f.num(cur.windDir)} ÷ 22.5) = ${f.num(Math.round((((cur.windDir % 360) + 360) % 360) / 22.5) % 16)}` },
          { label: t("result.beaufort"), value: `${f.num(bf)} · ${t(`beaufort.${bf}`)}`, emphasize: true },
          { label: t("ind.wind.max24"), value: `${f.wind(max24.windKmh)} · ${f.time(max24.t, d.place.zone)}` },
        ]}
      />
    </SectionCard>
  );
}

/* 4 · Pressure trend over 48 h with the ±1 hPa / 3 h steady band */
export function WxPressureCard({ d, f }: WxCardProps) {
  const t = useWxT();
  const rtl = useIsRtl();
  const hours = d.hours48;
  const cur = d.cur!;
  const [wrap, W] = useChartWidth(560);
  const H = 220;
  const L = 52;
  const R = 12;
  const T = 14;
  const B = 26;
  // No hourly step left in the forecast: the chart shows the current reading, so no scale divides by an empty series.
  const vals = hours.length ? hours.map((h) => h.pressureHpa) : [cur.pressureHpa];
  const lo = Math.floor(Math.min(...vals) - 1);
  const hi = Math.ceil(Math.max(...vals) + 1);
  const n = vals.length;
  const X = (i: number) => {
    const frac = i / Math.max(1, n - 1);
    return rtl ? W - L - frac * (W - L - R) : L + frac * (W - L - R);
  };
  const Y = (v: number) => T + ((hi - v) / (hi - lo)) * (H - T - B);
  const p0 = hours[0]?.pressureHpa ?? cur.pressureHpa;
  const p3 = hours[3]?.pressureHpa ?? p0;
  const i3 = Math.min(3, n - 1);
  const color = d.tendency.trend === "rising" ? "#10b981" : d.tendency.trend === "falling" ? "#ef4444" : "#2563eb";
  const minI = vals.indexOf(Math.min(...vals));
  const maxI = vals.indexOf(Math.max(...vals));
  return (
    <SectionCard id="wx-pressure" title={t("ind.pressure.title")}>
      <Intro text={t("ind.pressure.intro")} />
      <WxSplit
        layout="side"
        title={t("ind.worked")}
        chart={
          <div ref={wrap} className="w-full"><FitSvg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ direction: "ltr" }} className="block h-auto w-full" role="img" aria-label={t("ind.pressure.title")}>
            {[0, 0.25, 0.5, 0.75, 1].map((k) => {
              const v = lo + (hi - lo) * k;
              return (
                <g key={k}>
                  <line x1={rtl ? R : L} x2={rtl ? W - L : W - R} y1={Y(v)} y2={Y(v)} className={grid} />
                  <text style={{ fontSize: svgPx(12) }} x={rtl ? W - L + 4 : L - 4} y={Y(v) + 3} textAnchor={rtl ? "start" : "end"} className={axis}>{f.num(weatherPressure(v, f.units), f.units === "us" ? 2 : 0)}</text>
                </g>
              );
            })}
            <rect x={Math.min(X(0), X(i3))} y={Y(p0 + 1)} width={Math.abs(X(i3) - X(0))} height={Y(p0 - 1) - Y(p0 + 1)} fill={color} fillOpacity={0.15} />
            <path d={vals.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join("")} fill="none" stroke={color} strokeWidth={2.4} />
            <circle cx={X(0)} cy={Y(p0)} r={5} fill={color} />
            <circle cx={X(i3)} cy={Y(p3)} r={4} fill="#fff" stroke={color} strokeWidth={2} />
            <text style={{ fontSize: svgPx(12) }} x={X(minI)} y={Y(vals[minI]) + 14} textAnchor="middle" fontWeight={700} className={strong}>{f.num(weatherPressure(vals[minI], f.units), f.units === "us" ? 2 : 0)}</text>
            <text style={{ fontSize: svgPx(12) }} x={X(maxI)} y={Y(vals[maxI]) - 6} textAnchor="middle" fontWeight={700} className={strong}>{f.num(weatherPressure(vals[maxI], f.units), f.units === "us" ? 2 : 0)}</text>
            {hours.map((x, k) => (k % 12 === 0 ? <text style={{ fontSize: svgPx(12) }} key={k} x={X(k)} y={H - 6} textAnchor="middle" className={axis}>{f.weekday(x.t, d.place.zone)} {f.hour(x.t, d.place.zone)}</text> : null))}
            <text style={{ fontSize: svgPx(12) }} x={rtl ? R : W - R} y={T + 2} textAnchor={rtl ? "start" : "end"} className={axis}>{f.pressureUnit}</text>
          </FitSvg></div>
        }
        rows={[
          { label: t("ind.pressure.now"), value: f.pressure(p0) },
          { label: t("ind.pressure.plus3"), value: f.pressure(p3) },
          { label: t("ind.pressure.delta"), value: f.pressureDelta(p3 - p0) },
          { label: t("ind.pressure.rule"), value: t("ind.pressure.ruleValue") },
          { label: t("ind.pressure.trend"), value: t(`trend.${d.tendency.trend}`), emphasize: true },
          { label: t("ind.pressure.range"), value: `${f.pressure(Math.min(...vals))} – ${f.pressure(Math.max(...vals))}` },
        ]}
      />
    </SectionCard>
  );
}

/* 5 · Humidity: dew-point comfort zone strip */
export function WxHumidityCard({ d, f }: WxCardProps) {
  const t = useWxT();
  const cur = d.cur!;
  const dew = d.dewComputed!;
  const a = 17.625;
  const b = 243.04;
  const gamma = Math.log(Math.max(1, cur.rh) / 100) + (a * cur.tempC) / (b + cur.tempC);
  const lo = -10;
  const hi = 30;
  const pct = (v: number) => ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * 100;
  const colors = ["#f59e0b", "#10b981", "#eab308", "#f97316", "#dc2626"];
  const zone = dewComfort(dew);
  return (
    <SectionCard id="wx-humidity" title={t("ind.humidity.title")}>
      <Intro text={t("ind.humidity.intro")} />
      <WxSplit
        layout="stacked"
        title={t("ind.worked")}
        chart={
          <div className="w-full">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("result.humidity")}</p>
                <p dir="ltr" className="text-3xl font-bold text-blue-700 dark:text-blue-300">{f.num(cur.rh)}%</p>
              </div>
              <div className="text-end">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("result.dew")}</p>
                <p dir="ltr" className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{f.temp(dew, 1)}</p>
              </div>
            </div>
            <div dir="ltr" className="relative">
              <div className="flex h-8 overflow-hidden rounded-lg">
                {DEW_COMFORT_BANDS.map((z, k) => {
                  const from = Math.max(lo, z.from);
                  const to = Math.min(hi, z.to);
                  return (
                    <div key={z.key} className={`flex items-center justify-center text-xs font-bold text-white max-md:text-(color:--ink) ${zone === z.key ? "max-md:ring-2 max-md:ring-inset max-md:ring-zinc-900 max-md:dark:ring-white" : "opacity-60 max-md:font-medium max-md:opacity-100"}`} style={{ width: `${((to - from) / (hi - lo)) * 100}%`, background: colors[k], "--ink": inkOn(colors[k]) } as CSSProperties}>
                      {f.num(weatherTemp(from, f.units))}°
                    </div>
                  );
                })}
              </div>
              <div className="absolute -top-3 flex -translate-x-1/2 flex-col items-center transition-all duration-700" style={{ left: `${pct(dew)}%` }}>
                <span className="h-0 w-0 border-x-[7px] border-t-[10px] border-x-transparent border-t-zinc-900 dark:border-t-white" />
                <span className="h-10 w-0.5 bg-zinc-900 dark:bg-white" />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1 text-center text-xs leading-4">
              {DEW_COMFORT_BANDS.map((z, k) => (
                <span key={z.key} className={zone === z.key ? `font-bold text-zinc-900 dark:text-zinc-50 ${paletteTextClass(colors[k])}` : "text-zinc-500 dark:text-zinc-400"} style={zone === z.key ? { color: colors[k] } : undefined}>
                  {t(`dewComfort.${z.key}`)}
                </span>
              ))}
            </div>
          </div>
        }
        rows={[
          { label: "T, RH", value: `${f.num(cur.tempC, 1)} °C, ${f.num(cur.rh)}%` },
          { label: "γ = ln(RH/100) + aT/(b+T)", value: f.num(gamma, 3) },
          { label: "Td = bγ / (a − γ)", value: `${f.num(dew, 1)} °C`, emphasize: true },
          { label: t("ind.humidity.metDew"), value: cur.dewC !== null ? `${f.num(cur.dewC, 1)} °C` : t("result.notProvided") },
          { label: t("ind.humidity.comfort"), value: t(`dewComfort.${zone}`) },
          { label: t("ind.humidity.spread"), value: `${f.num(cur.tempC - dew, 1)} °C` },
        ]}
      />
    </SectionCard>
  );
}

/* 6 · UV index (clear sky) gradient gauge with advice */
export function WxUvCard({ d, f }: WxCardProps) {
  const t = useWxT();
  const uvNow = d.cur?.uv ?? null;
  const peak = d.hours48.slice(0, 24).reduce<{ uv: number; t: number } | null>((a, h) => (h.uv !== null && (!a || h.uv > a.uv) ? { uv: h.uv, t: h.t } : a), null);
  const uv = d.uvMaxToday;
  if (uv === null && uvNow === null) {
    return (
      <SectionCard id="wx-uv" title={t("ind.uv.title")}>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("ind.uv.missing")}</p>
      </SectionCard>
    );
  }
  const val = uv ?? uvNow ?? 0;
  const level = uvLevel(val);
  const S = 260;
  const c = S / 2;
  const r = 100;
  const MAX = 14;
  const ang = (v: number) => Math.PI + (Math.min(MAX, v) / MAX) * Math.PI;
  const pt = (v: number, rr: number) => [c + rr * Math.cos(ang(v)), 150 + rr * Math.sin(ang(v))] as const;
  const colors = ["#22c55e", "#eab308", "#f97316", "#dc2626", "#7c3aed"];
  return (
    <SectionCard id="wx-uv" title={t("ind.uv.title")}>
      <Intro text={t("ind.uv.intro")} />
      <WxSplit
        layout="side"
        title={t("ind.worked")}
        chart={
          <div className="flex flex-col items-center">
            <svg viewBox={`0 0 ${S} 180`} width={S} height={180} style={{ direction: "ltr" }} role="img" aria-label={t("ind.uv.title")}>
              {UV_BANDS.map((b, k) => {
                const [x0, y0] = pt(b.from, r);
                const [x1, y1] = pt(b.to, r);
                return <path key={b.key} d={`M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`} fill="none" stroke={colors[k]} strokeWidth={22} />;
              })}
              {[0, 3, 6, 8, 11, 14].map((v) => {
                const [x, y] = pt(v, r + 20);
                return <text style={{ fontSize: svgPx(12) }} key={v} x={x} y={y + 3} textAnchor="middle" className={axis}>{v === 14 ? "14+" : v}</text>;
              })}
              <g style={{ transition: "transform 900ms ease" }}>
                <line x1={c} y1={150} x2={pt(val, r - 18)[0]} y2={pt(val, r - 18)[1]} stroke="#0f172a" strokeWidth={3} strokeLinecap="round" className="dark:stroke-white" />
              </g>
              <circle cx={c} cy={150} r={7} className="fill-zinc-900 dark:fill-white" />
              <text style={{ fontSize: svgPx(26) }} x={c} y={128} textAnchor="middle" fontWeight={800} className={strong}>{f.num(val, 1)}</text>
            </svg>
            <p className={`text-sm font-bold ${paletteTextClass(colors[UV_BANDS.findIndex((b) => b.key === level)])}`} style={{ color: colors[UV_BANDS.findIndex((b) => b.key === level)] }}>{t(`uv.${level}`)}</p>
            <p className="mt-1 max-w-[260px] text-center text-xs text-zinc-600 dark:text-zinc-300">{t(`uvAdvice.${level}`)}</p>
          </div>
        }
        rows={[
          { label: t("ind.uv.now"), value: uvNow !== null ? f.num(uvNow, 1) : "—" },
          { label: t("ind.uv.peak"), value: peak ? `${f.num(peak.uv, 1)} · ${f.time(peak.t, d.place.zone)}` : "—", emphasize: true },
          { label: t("ind.uv.band"), value: `${t(`uv.${level}`)} (${UV_BANDS.find((b) => b.key === level)!.from}–${UV_BANDS.find((b) => b.key === level)!.to - 1})` },
          { label: t("ind.uv.kind"), value: t("ind.uv.kindValue") },
          { label: t("ind.uv.cloud"), value: `${f.num(d.cur?.cloud ?? 0)}%` },
        ]}
      />
    </SectionCard>
  );
}

/* 7 · Daylight timeline with stations (dawn, sunrise, noon, sunset, dusk, now) */
export function WxSunCard({ d, f }: WxCardProps) {
  const t = useWxT();
  const rtl = useIsRtl();
  const s = d.sun;
  const [wrap, W] = useChartWidth(600);
  const H = 160;
  const X = (m: number) => {
    const frac = Math.min(1440, Math.max(0, m)) / 1440;
    return rtl ? W - 20 - frac * (W - 40) : 20 + frac * (W - 40);
  };
  /** Bar between two times as {x, width}, whichever way the axis runs. */
  const bar = (a: number, b: number) => ({ x: Math.min(X(a), X(b)), width: Math.abs(X(b) - X(a)) });
  const stations: { key: string; m: number | null; color: string }[] = [
    { key: "dawn", m: s.civilDawn, color: "#6366f1" },
    { key: "sunrise", m: s.sunrise, color: "#f59e0b" },
    { key: "noon", m: s.solarNoon, color: "#eab308" },
    { key: "sunset", m: s.sunset, color: "#f97316" },
    { key: "dusk", m: s.civilDusk, color: "#8b5cf6" },
  ];
  const ok = s.sunrise !== null && s.sunset !== null;
  return (
    <SectionCard id="wx-sun" title={t("ind.sun.title")}>
      <Intro text={t("ind.sun.intro")} />
      <WxSplit
        layout="stacked"
        title={t("ind.worked")}
        chart={
          <div ref={wrap} className="w-full"><svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ direction: "ltr" }} className="block h-auto w-full" role="img" aria-label={t("ind.sun.title")}>
            <rect x={20} y={60} width={W - 40} height={22} rx={11} fill="#1e293b" />
            {s.civilDawn !== null && s.civilDusk !== null && <rect {...bar(s.civilDawn, s.civilDusk)} y={60} height={22} fill="#818cf8" />}
            {ok && <rect {...bar(s.sunrise!, s.sunset!)} y={60} height={22} fill="#fcd34d" />}
            {s.polar === "day" && <rect x={20} y={60} width={W - 40} height={22} rx={11} fill="#fcd34d" />}
            {[0, 360, 720, 1080, 1440].map((m) => (
              <text style={{ fontSize: svgPx(12) }} key={m} x={X(m)} y={104} textAnchor="middle" className={axis}>{m === 1440 ? "24:00" : f.hhmm(m)}</text>
            ))}
            {stations.map((st, k) =>
              st.m === null ? null : (
                <g key={st.key}>
                  <line x1={X(st.m)} x2={X(st.m)} y1={k % 2 ? 84 : 36} y2={k % 2 ? 112 : 58} stroke={st.color} strokeWidth={2} />
                  <circle cx={X(st.m)} cy={71} r={5} fill={st.color} stroke="#fff" strokeWidth={1.5} />
                  <text style={{ fontSize: svgPx(12) }} x={X(st.m)} y={k % 2 ? 126 : 30} textAnchor="middle" fontWeight={700} fill={st.color}>{f.hhmm(st.m)}</text>
                </g>
              ),
            )}
            <g style={{ transition: "transform 600ms ease" }}>
              <line x1={X(d.localMinutes)} x2={X(d.localMinutes)} y1={50} y2={92} stroke="#ef4444" strokeWidth={2.5} />
              <text style={{ fontSize: svgPx(12) }} x={X(d.localMinutes)} y={156} textAnchor="middle" fontWeight={800} fill="#ef4444">▲ {f.time(d.now, d.place.zone)}</text>
            </g>
          </svg></div>
        }
        rows={[
          { label: t("ind.sun.dawn"), value: s.civilDawn !== null ? f.hhmm(s.civilDawn) : "—" },
          { label: t("result.sunrise"), value: s.sunrise !== null ? f.hhmm(s.sunrise) : t(`polar.${s.polar ?? "night"}`) },
          { label: t("ind.sun.noon"), value: f.hhmm(s.solarNoon) },
          { label: t("result.sunset"), value: s.sunset !== null ? f.hhmm(s.sunset) : t(`polar.${s.polar ?? "night"}`) },
          { label: t("ind.sun.dusk"), value: s.civilDusk !== null ? f.hhmm(s.civilDusk) : "—" },
          { label: t("result.dayLength"), value: t("units.hm", { h: Math.floor(s.dayLengthMin / 60), m: Math.round(s.dayLengthMin % 60) }), emphasize: true },
          { label: t("ind.sun.twilight"), value: t("units.m", { n: Math.round(s.civilTwilightMin) }) },
        ]}
      />
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-600 dark:text-zinc-300">
        {stations.map((st) => (
          <span key={st.key} className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: st.color }} />{t(`ind.sun.${st.key}`)}</span>
        ))}
      </div>
    </SectionCard>
  );
}

/* 8 · Moon phase ladder (8 phases, current highlighted) */
export function WxMoonCard({ d, f }: WxCardProps) {
  const t = useWxT();
  const m = d.moon;
  const southern = d.place.lat < 0;
  return (
    <SectionCard id="wx-moon" title={t("ind.moon.title")}>
      <Intro text={t("ind.moon.intro")} />
      <WxSplit
        layout="side"
        title={t("ind.worked")}
        chart={
          <div className="w-full max-w-[560px]" style={{ minWidth: "min(100%, 440px)" }}>
            <div className="flex items-center justify-center gap-6">
              <svg viewBox="0 0 120 120" width={120} height={120} role="img" aria-label={t(`moon.${m.phase}`)}>
                <circle cx={60} cy={60} r={52} fill="#1f2937" />
                <g transform={southern ? "translate(120,0) scale(-1,1)" : undefined}>
                  <path d={moonPath(60, 60, 52, m.illumination, m.waxing)} fill="#f1f5f9" />
                </g>
                <circle cx={60} cy={60} r={52} fill="none" stroke="#94a3b8" strokeOpacity={0.5} />
              </svg>
              <div>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{t(`moon.${m.phase}`)}</p>
                <p dir="ltr" className="text-3xl font-bold text-blue-700 dark:text-blue-300">{f.num(m.illumination * 100)}%</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-8 gap-1">
              {MOON_PHASES.map((p, k) => {
                const ill = (1 - Math.cos((2 * Math.PI * k) / 8)) / 2;
                const on = p === m.phase;
                return (
                  <div key={p} className={`flex flex-col items-center rounded-lg p-1 ${on ? "bg-blue-600/15 ring-2 ring-blue-500" : ""}`}>
                    <svg viewBox="0 0 30 30" width={30} height={30} aria-hidden>
                      <circle cx={15} cy={15} r={12} fill="#334155" />
                      <g transform={southern ? "translate(30,0) scale(-1,1)" : undefined}>
                        <path d={moonPath(15, 15, 12, ill, k < 4)} fill="#e2e8f0" />
                      </g>
                    </svg>
                  </div>
                );
              })}
            </div>
            <div className="mt-1 grid grid-cols-8 gap-1 text-center text-xs leading-3 text-zinc-500 dark:text-zinc-400">
              {MOON_PHASES.map((p) => (
                <span key={p} className={p === m.phase ? "font-bold text-blue-700 dark:text-blue-300" : ""}>{t(`moon.${p}`)}</span>
              ))}
            </div>
          </div>
        }
        rows={[
          { label: t("ind.moon.age"), value: t("units.d", { n: f.num(m.ageDays, 1) }) },
          { label: "k = (1 − cos(2π·age/29.53)) / 2", value: `${f.num(m.illumination * 100, 1)}%`, emphasize: true },
          { label: t("ind.moon.direction"), value: t(m.waxing ? "ind.moon.waxing" : "ind.moon.waning") },
          { label: t("ind.moon.nextFull"), value: f.dayMonth(m.nextFullMoonMs, d.place.zone) },
          { label: t("ind.moon.nextNew"), value: f.dayMonth(m.nextNewMoonMs, d.place.zone) },
          { label: t("ind.moon.view"), value: t(southern ? "ind.moon.south" : "ind.moon.north") },
        ]}
      />
    </SectionCard>
  );
}
