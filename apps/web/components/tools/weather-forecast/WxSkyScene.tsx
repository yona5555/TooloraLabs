"use client";
import { useSyncExternalStore, useId } from "react";
import { precipitationKind } from "@tooloralabs/tools";
import type { WxDerived, WxFmt } from "./wx";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 360;
const H = 230;
const HORIZON = 168;

function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
}

/** Sky colours by solar elevation: night, civil twilight, golden hour, day. */
function skyColors(elev: number): [string, string] {
  if (elev < -6) return ["#0b1026", "#1e2a5a"];
  if (elev < -0.833) return ["#2b2c6b", "#c2577f"];
  if (elev < 6) return ["#4a78c2", "#f5a35c"];
  return ["#2f7fd8", "#a9d8ff"];
}

/** Lit part of the Moon's disc as an SVG path (waxing lit on the right, northern-hemisphere view). */
export function moonPath(cx: number, cy: number, r: number, illumination: number, waxing: boolean): string {
  const rx = Math.abs(1 - 2 * illumination) * r;
  const crescent = illumination < 0.5;
  const litSweep = waxing ? 1 : 0;
  const termSweep = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0;
  return `M${cx},${cy - r} A${r},${r} 0 0 ${litSweep} ${cx},${cy + r} A${rx.toFixed(2)},${r} 0 0 ${termSweep} ${cx},${cy - r}Z`;
}

/** Point on the day arc for a 0…1 fraction between rise and set. */
function arcPoint(frac: number): [number, number] {
  const x = 30 + frac * (W - 60);
  const t = Math.min(1, Math.max(0, frac));
  const y = HORIZON - 512 * t * (1 - t);
  return [x, y];
}

const STARS = Array.from({ length: 34 }, (_, i) => [(i * 97) % W, 8 + ((i * 53) % 120), 0.6 + ((i * 7) % 3) * 0.4] as const);

/**
 * Animated 2D sky for the current hour: the real sun position on its sunrise–sunset arc (or the
 * Moon at night, drawn in its actual phase), clouds from MET cloud cover drifting with the wind
 * direction and speed, and falling rain/snow from the forecast symbol.
 */
export default function WxSkyScene({ d, f }: { d: WxDerived; f: WxFmt }) {
  const svgId = useId();
  const reduced = useReducedMotion();
  const cur = d.cur!;
  const [top, bottom] = skyColors(d.sunElevation);
  const night = d.sunElevation < -0.833;
  const { sunrise, sunset } = d.sun;
  const dayFrac = sunrise !== null && sunset !== null ? (d.localMinutes - sunrise) / (sunset - sunrise) : d.sun.polar === "day" ? 0.5 : -1;
  const nightLen = sunrise !== null && sunset !== null ? 1440 - (sunset - sunrise) : 1440;
  const nightFrac = sunset !== null ? (((d.localMinutes - sunset + 1440) % 1440) / nightLen) : 0.5;
  const [sx, sy] = arcPoint(dayFrac);
  const [mx, my] = arcPoint(nightFrac);
  const clouds = Math.round(cur.cloud / 14);
  const kind = precipitationKind(d.category);
  // Wind "from" 270° (westerly) carries clouds east (to the right).
  const drift = Math.sin(((cur.windDir + 180) * Math.PI) / 180) >= 0 ? 1 : -1;
  const speed = Math.max(14, 70 - cur.windKmh);
  const fog = d.category === "fog" || (cur.fog ?? 0) > 50;
  const southern = d.place.lat < 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ direction: "ltr" }} className="block h-auto w-full rounded-lg" role="img" aria-label="sky">
      <defs>
        <linearGradient id={`${svgId}wx-sky`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <radialGradient id={`${svgId}wx-sky-sun`}>
          <stop offset="0" stopColor="#fff7c2" />
          <stop offset="0.45" stopColor="#fde047" />
          <stop offset="1" stopColor="#fde047" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${svgId}wx-sky)`} />
      {night && STARS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" fillOpacity={0.4 + (i % 3) * 0.2} />)}

      <path d={`M30,${HORIZON} Q${W / 2},${HORIZON - 256} ${W - 30},${HORIZON}`} fill="none" stroke="#fff" strokeOpacity={0.35} strokeDasharray="3 5" />

      {!night && dayFrac >= 0 && (
        <g>
          <circle cx={sx} cy={sy} r={30} fill={`url(#${svgId}wx-sky-sun)`}>
            {!reduced && <animate attributeName="r" values="26;32;26" dur="4s" repeatCount="indefinite" />}
          </circle>
          <circle cx={sx} cy={sy} r={11} fill="#facc15" stroke="#f59e0b" strokeWidth={1.5} />
        </g>
      )}
      {night && (
        <g transform={southern ? `translate(${2 * mx},0) scale(-1,1)` : undefined}>
          <circle cx={mx} cy={my} r={12} fill="#1f2937" stroke="#e5e7eb" strokeOpacity={0.4} />
          <path d={moonPath(mx, my, 12, d.moon.illumination, d.moon.waxing)} fill="#f1f5f9" />
        </g>
      )}

      {Array.from({ length: clouds }, (_, i) => {
        const y = 22 + ((i * 37) % 90);
        const x0 = (i * 71) % W;
        const scale = 0.7 + ((i * 13) % 5) / 10;
        const grey = kind || d.category === "cloudy" ? "#9ca3af" : "#ffffff";
        return (
          <g key={i} opacity={0.88} transform={`translate(${x0},${y})`}>
            {!reduced && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values={drift > 0 ? `${x0 - W},${y};${x0 + 60},${y}` : `${x0 + 60},${y};${x0 - W},${y}`}
                dur={`${speed + i * 3}s`}
                begin={`-${(i * 7) % speed}s`}
                repeatCount="indefinite"
              />
            )}
            <g transform={`scale(${scale})`}>
              <ellipse cx={30} cy={14} rx={30} ry={12} fill={grey} />
              <ellipse cx={18} cy={8} rx={14} ry={11} fill={grey} />
              <ellipse cx={40} cy={6} rx={16} ry={12} fill={grey} />
            </g>
          </g>
        );
      })}

      {kind &&
        Array.from({ length: kind === "rain" ? 36 : 28 }, (_, i) => {
          const x = (i * 41) % W;
          const delay = (i % 9) * 0.13;
          return kind === "rain" ? (
            <line key={i} x1={x} x2={x - 3 * drift} y1={40} y2={50} stroke="#bfdbfe" strokeWidth={1.4} strokeLinecap="round">
              {!reduced && <animateTransform attributeName="transform" type="translate" values={`0,0;${-12 * drift},${HORIZON - 40}`} dur="0.9s" begin={`${delay}s`} repeatCount="indefinite" />}
            </line>
          ) : (
            <circle key={i} cx={x} cy={44} r={kind === "snow" ? 2.2 : 1.6} fill={kind === "snow" ? "#ffffff" : "#dbeafe"}>
              {!reduced && <animateTransform attributeName="transform" type="translate" values={`0,0;${-8 * drift},${HORIZON - 44}`} dur={kind === "snow" ? "3.2s" : "1.6s"} begin={`${delay * 3}s`} repeatCount="indefinite" />}
            </circle>
          );
        })}
      {d.category === "thunderstorm" && !reduced && (
        <rect width={W} height={HORIZON} fill="#fff" opacity={0}>
          <animate attributeName="opacity" values="0;0;0.55;0;0.3;0;0" keyTimes="0;0.8;0.82;0.85;0.87;0.9;1" dur="5s" repeatCount="indefinite" />
        </rect>
      )}
      {fog && [0, 1, 2].map((i) => <rect key={i} x={0} y={HORIZON - 40 + i * 14} width={W} height={10} rx={5} fill="#e5e7eb" opacity={0.45} />)}

      <path d={`M0,${HORIZON} Q60,${HORIZON - 14} 120,${HORIZON - 4} T240,${HORIZON - 6} T${W},${HORIZON - 2} V${H} H0Z`} fill={night ? "#0f172a" : "#365314"} />
      <rect y={HORIZON + 8} width={W} height={H - HORIZON - 8} fill={night ? "#020617" : "#1a2e05"} opacity={0.6} />

      <text style={{ fontSize: svgPx(12) }} x={30} y={H - 26} textAnchor="middle" fontWeight={700} fill="#fde68a">☀↑ {sunrise !== null ? f.hhmm(sunrise) : "—"}</text>
      <text style={{ fontSize: svgPx(12) }} x={W - 30} y={H - 26} textAnchor="middle" fontWeight={700} fill="#fdba74">☀↓ {sunset !== null ? f.hhmm(sunset) : "—"}</text>
      <text style={{ fontSize: svgPx(12) }} x={W / 2} y={H - 26} textAnchor="middle" fontWeight={700} fill="#f8fafc">
        {f.time(d.now, d.place.zone)} · {f.num(d.sunElevation, 1)}°
      </text>
      <text style={{ fontSize: svgPx(12) }} x={W / 2} y={H - 9} textAnchor="middle" fill="#e2e8f0">
        ☁ {f.num(cur.cloud)}% · ➶ {f.wind(cur.windKmh)}
      </text>
      <text x={W - 8} y={24} textAnchor="end" fontWeight={800} fill="#fff" style={{ fontSize: svgPx(22), paintOrder: "stroke" }} stroke="#0f172a" strokeOpacity={0.35} strokeWidth={3}>
        {f.deg(cur.tempC)}
      </text>
    </svg>
  );
}
