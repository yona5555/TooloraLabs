"use client";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { countdownCivilInZone, countdownResolveTarget, gregorianToHijri, hijriFieldsToCivil, hijriMonthLength, zonedParts, type CountdownPreset } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { AMBER, axisText, BLUE, GREEN, useIndT, valueText, VIOLET, type IndicatorProps } from "./CountdownIndicatorsA";
import { fmtHijri, fmtInZone, formatOffset, hijriMonthName, num, two, zoneName, type CdState } from "./model";
import { px2 } from "@/components/tool-ui/indicator-kit/SvgBits";

const DAY_MS = 86_400_000;

/* 5 · Log-scale magnitude: the same wait in seconds … years */
export function CdLogScaleCard({ d }: IndicatorProps) {
  const t = useIndT();
  const s = Math.max(1, d.b.totalSeconds);
  const units = [
    { key: "seconds", v: s, div: "1" },
    { key: "minutes", v: s / 60, div: "60" },
    { key: "hours", v: s / 3600, div: "3600" },
    { key: "days", v: s / 86_400, div: "86400" },
    { key: "weeks", v: s / 604_800, div: "604800" },
    { key: "months", v: s / 2_629_746, div: "2629746" },
    { key: "years", v: s / 31_556_952, div: "31556952" },
  ];
  const W = 420;
  const RH = 27;
  const L = 64;
  const R = 70;
  const H = units.length * RH + 26;
  const maxExp = Math.max(2, Math.ceil(Math.log10(s)));
  const minExp = -2;
  const x = (v: number) => L + ((Math.log10(Math.max(10 ** minExp, v)) - minExp) / (maxExp - minExp)) * (W - L - R);
  const colors = [AMBER, GREEN, VIOLET, BLUE, "#0ea5e9", "#ec4899", "#64748b"];
  const fmt = (v: number) => (v >= 100 ? num(Math.floor(v)) : num(v, v >= 1 ? 2 : 3));
  return (
    <SectionCard title={t("log.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("log.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("log.title")} className="max-w-full" style={{ direction: "ltr" }}>
            {Array.from({ length: maxExp - minExp + 1 }, (_, i) => minExp + i).map((e) => (
              <g key={e}>
                <line x1={x(10 ** e)} x2={x(10 ** e)} y1={0} y2={H - 18} stroke="currentColor" strokeOpacity={e === 0 ? 0.35 : 0.1} />
                <text x={x(10 ** e)} y={H - 5} textAnchor="middle" fontSize={8.5} className={axisText}>10<tspan baselineShift="super" fontSize={6.5}>{e}</tspan></text>
              </g>
            ))}
            {units.map((u, i) => (
              <g key={u.key}>
                <text x={L - 6} y={i * RH + 17} textAnchor="end" fontSize={10} fontWeight={700} className={valueText}>{t(`log.u.${u.key}`)}</text>
                <rect x={L} y={i * RH + 5} width={Math.max(2, x(u.v) - L)} height={RH - 9} rx={4} fill={colors[i]} style={{ transition: "width 900ms linear" }} />
                <text x={x(u.v) + 5} y={i * RH + 17} fontSize={10} fontWeight={800} className={valueText}>{fmt(u.v)}</text>
              </g>
            ))}
          </svg>
        }
        rows={[
          ...units.map((u) => ({ label: t(`log.u.${u.key}`), value: fmt(u.v), note: u.div === "1" ? undefined : `${num(s)} ÷ ${num(Number(u.div))}` })),
          { label: t("log.orders"), value: num(Math.log10(s), 2), note: `log₁₀ ${num(s)}`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

function ClockFace({ cx, cy, h, m, color, dayShift }: { cx: number; cy: number; h: number; m: number; color: string; dayShift: number }) {
  const r = 46;
  const ha = ((h % 12) + m / 60) * 30 - 90;
  const ma = m * 6 - 90;
  const rad = (a: number) => (a * Math.PI) / 180;
  const night = h < 6 || h >= 18;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={night ? "#1e293b" : "#fefce8"} stroke={color} strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = rad(i * 30 - 90);
        return <line key={i} x1={px2(cx + (r - 6) * Math.cos(a))} y1={px2(cy + (r - 6) * Math.sin(a))} x2={px2(cx + (r - 2) * Math.cos(a))} y2={px2(cy + (r - 2) * Math.sin(a))} stroke={night ? "#cbd5e1" : "#475569"} strokeWidth={i % 3 === 0 ? 2 : 1} />;
      })}
      <line x1={cx} y1={cy} x2={px2(cx + 24 * Math.cos(rad(ha)))} y2={px2(cy + 24 * Math.sin(rad(ha)))} stroke={night ? "#f8fafc" : "#0f172a"} strokeWidth={3.5} strokeLinecap="round" style={{ transition: "all 600ms ease" }} />
      <line x1={cx} y1={cy} x2={px2(cx + 36 * Math.cos(rad(ma)))} y2={px2(cy + 36 * Math.sin(rad(ma)))} stroke={color} strokeWidth={2.2} strokeLinecap="round" style={{ transition: "all 600ms ease" }} />
      <circle cx={cx} cy={cy} r={3} fill={color} />
      <text x={cx} y={cy + r + 18} textAnchor="middle" fontSize={15} fontWeight={800} className={valueText} style={{ fontFamily: "ui-monospace, monospace" }}>
        {`${two(h)}:${two(m)}`}
        {dayShift !== 0 && (
          <tspan fontSize={10} fill={AMBER}>{` ${dayShift > 0 ? "+" : "−"}${Math.abs(dayShift)}d`}</tspan>
        )}
      </text>
    </g>
  );
}

/* 6 · Side-by-side equivalence: the event instant on three clocks (event zone, yours, UTC) */
export function CdZoneEquivalenceCard({ state, d }: IndicatorProps) {
  const t = useIndT();
  const tr = useTranslations("tools.countdown-to-event-calculator.pro.result");
  const locale = useLocale();
  const W = 420;
  const H = 150;
  const zones = [
    { zone: state.zone, name: zoneName(locale, state.zone), color: BLUE },
    { zone: d.viewerZone, name: zoneName(locale, d.viewerZone), color: GREEN },
    { zone: "UTC", name: "UTC", color: VIOLET },
  ];
  const ev = zonedParts(d.target.utcMs, state.zone);
  const evDay = Date.UTC(ev.year, ev.month - 1, ev.day);
  const parts = zones.map((z) => {
    const p = zonedParts(d.target.utcMs, z.zone);
    return { ...z, p, shift: Math.round((Date.UTC(p.year, p.month - 1, p.day) - evDay) / DAY_MS) };
  });
  return (
    <SectionCard title={t("zones.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("zones.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-[420px] max-w-full">
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("zones.title")} className="max-w-full" style={{ direction: "ltr" }}>
              {parts.map((z, i) => (
                <ClockFace key={z.zone + i} cx={70 + i * 140} cy={56} h={z.p.hour} m={z.p.minute} color={z.color} dayShift={z.shift} />
              ))}
              <text x={140} y={60} textAnchor="middle" fontSize={20} fontWeight={800} className={axisText}>=</text>
              <text x={280} y={60} textAnchor="middle" fontSize={20} fontWeight={800} className={axisText}>=</text>
            </svg>
            <div className="grid grid-cols-3 text-center text-[11px] font-semibold text-zinc-600 dark:text-zinc-300" dir="ltr">
              {parts.map((z, i) => (
                <span key={i} style={{ color: z.color }} className="truncate px-1">{z.name}</span>
              ))}
            </div>
          </div>
        }
        rows={[
          ...parts.map((z) => ({
            label: z.name,
            value: fmtInZone(locale, d.target.utcMs, z.zone),
            note: formatOffset(Math.round((Date.UTC(z.p.year, z.p.month - 1, z.p.day, z.p.hour, z.p.minute) - Math.floor(d.target.utcMs / 60_000) * 60_000) / 60_000)),
          })),
          { label: tr("dst"), value: d.target.dst ? tr("dstOn") : tr("dstOff"), note: `${formatOffset(d.nowOffset)} → ${formatOffset(d.target.offsetMinutes)}` },
          {
            label: tr("status"),
            value: d.target.status === "ok" ? tr("statusOk") : d.target.status === "gap" ? t("zones.gap") : tr("statusOverlap"),
            emphasize: true,
          },
        ]}
      />
    </SectionCard>
  );
}

/* 7 · Zone strip: the Hijri (Umm al-Qura) year of the event, month by month */
export function CdHijriYearCard({ state, d }: IndicatorProps) {
  const t = useIndT();
  const locale = useLocale();
  const hy = d.hijri.year;
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ m: i + 1, len: hijriMonthLength(hy, i + 1), name: hijriMonthName(locale, hy, i + 1) })), [hy, locale]);
  const yearLen = months.reduce((s, m) => s + m.len, 0);
  const today = gregorianToHijri(countdownCivilInZone(d.nowMs, state.zone));
  const W = 420;
  const H = 120;
  const L = 6;
  const BW = W - 2 * L;
  const startOf = (m: number) => months.slice(0, m - 1).reduce((s, x) => s + x.len, 0);
  const pos = (m: number, day: number) => L + ((startOf(m) + day - 0.5) / yearLen) * BW;
  const color = (m: number) => (m === 9 ? GREEN : m === 12 ? AMBER : m === 1 ? BLUE : m % 2 ? "#94a3b8" : "#cbd5e1");
  const eventPos = pos(d.hijri.month, d.hijri.day);
  const dayOfYear = startOf(d.hijri.month) + d.hijri.day;
  const firstOfYear = hijriFieldsToCivil(hy, 1, 1);
  return (
    <SectionCard title={t("hijri.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("hijri.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("hijri.title")} className="max-w-full" style={{ direction: "ltr" }}>
            {months.map((m) => {
              const x0 = L + (startOf(m.m) / yearLen) * BW;
              const w = (m.len / yearLen) * BW;
              return (
                <g key={m.m}>
                  <rect x={x0 + 0.5} y={40} width={w - 1} height={34} fill={color(m.m)} rx={3} />
                  <text x={x0 + w / 2} y={61} textAnchor="middle" fontSize={11} fontWeight={800} fill={m.m === 9 || m.m === 12 || m.m === 1 ? "white" : "#0f172a"}>{m.m}</text>
                  <text x={x0 + w / 2} y={88} textAnchor="middle" fontSize={8.5} className={axisText}>{m.len}</text>
                </g>
              );
            })}
            {today.year === hy && (
              <g>
                <line x1={pos(today.month, today.day)} x2={pos(today.month, today.day)} y1={36} y2={78} stroke={VIOLET} strokeWidth={2.5} strokeDasharray="3 2" />
                <text x={pos(today.month, today.day)} y={104} textAnchor="middle" fontSize={9} fontWeight={700} fill={VIOLET}>▲</text>
              </g>
            )}
            <g style={{ transition: "transform 500ms ease" }} transform={`translate(${eventPos} 0)`}>
              <line x1={0} x2={0} y1={22} y2={78} stroke="#dc2626" strokeWidth={2.5} />
              <rect x={-26} y={6} width={52} height={17} rx={8} fill="#dc2626" />
              <text x={0} y={18} textAnchor="middle" fontSize={10} fontWeight={800} fill="white">{`${d.hijri.day}/${d.hijri.month}`}</text>
            </g>
          </svg>
        }
        rows={[
          { label: t("hijri.event"), value: fmtHijri(locale, d.target.date) },
          { label: t("hijri.month"), value: `${months[d.hijri.month - 1].name} · ${months[d.hijri.month - 1].len}`, note: t("hijri.monthNote") },
          { label: t("hijri.dayOfYear"), value: `${num(dayOfYear)} / ${num(yearLen)}`, note: `${months.slice(0, d.hijri.month - 1).map((m) => m.len).join(" + ") || "0"} + ${d.hijri.day}` },
          { label: t("hijri.today"), value: `${today.day}/${today.month}/${today.year}` },
          { label: t("hijri.yearStart"), value: firstOfYear ? fmtInZone(locale, Date.UTC(firstOfYear.year, firstOfYear.month - 1, firstOfYear.day, 12), "UTC", false) : "—" },
          { label: t("hijri.yearLength"), value: num(yearLen), note: t("hijri.yearNote"), emphasize: true },
        ]}
      />
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-600 dark:text-zinc-300">
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ background: GREEN }} />{months[8].name}</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ background: AMBER }} />{months[11].name}</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ background: BLUE }} />{months[0].name}</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-0.5" style={{ background: VIOLET }} />{t("hijri.todayMark")}</span>
      </div>
    </SectionCard>
  );
}

/* 8 · Ranked horizontal bars: this event vs the calendar presets and saved countdowns (click to open) */
export function CdRankedCard({ state, setState, d, presets, onPreset }: IndicatorProps & { presets: CountdownPreset[]; onPreset: (p: CountdownPreset) => void }) {
  const t = useIndT();
  const tp = useTranslations("tools.countdown-to-event-calculator.pro.presets");
  const ts = useTranslations("tools.countdown-to-event-calculator.pro.saved");
  const locale = useLocale();
  type Item = { id: string; label: string; ms: number; kind: "current" | "preset" | "saved"; open: () => void };
  const items: Item[] = [
    { id: "current", label: state.title || ts("untitled"), ms: d.target.utcMs, kind: "current" as const, open: () => {} },
    ...presets.map((p) => ({
      id: p.key,
      label: tp(p.key),
      ms: countdownResolveTarget(p.date, p.clock, state.zone).utcMs,
      kind: "preset" as const,
      open: () => onPreset(p),
    })),
    ...d.saved.map((s) => ({ id: s.id, label: s.title || ts("untitled"), ms: s.utcMs, kind: "saved" as const, open: () => setState(s.state as CdState) })),
  ]
    .filter((x) => x.ms > d.nowMs)
    .sort((a, b) => a.ms - b.ms)
    .slice(0, 12);
  const max = Math.max(1, ...items.map((x) => x.ms - d.nowMs));
  const rank = items.findIndex((x) => x.kind === "current") + 1;
  const color = { current: BLUE, preset: AMBER, saved: GREEN };
  return (
    <SectionCard title={t("ranked.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("ranked.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <ul className="w-[420px] max-w-full space-y-1.5">
            {items.map((x) => {
              const days = (x.ms - d.nowMs) / DAY_MS;
              return (
                <li key={x.id + x.kind}>
                  <button
                    type="button"
                    onClick={x.open}
                    disabled={x.kind === "current"}
                    className={`grid w-full grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-2 rounded-lg px-1.5 py-1 text-start text-xs transition ${x.kind === "current" ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-500/10" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                  >
                    <span className="truncate font-semibold text-zinc-700 dark:text-zinc-200">{x.label}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-3.5 rounded" style={{ width: `${Math.max(2, ((x.ms - d.nowMs) / max) * 100)}%`, background: color[x.kind], transition: "width 500ms ease" }} />
                      <span dir="ltr" className="shrink-0 font-mono font-bold text-zinc-800 dark:text-zinc-100">{num(days, days < 10 ? 1 : 0)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        }
        rows={[
          { label: t("ranked.rank"), value: `${rank} / ${items.length}` },
          { label: t("ranked.nearest"), value: items[0]?.label ?? "", note: items[0] ? fmtInZone(locale, items[0].ms, state.zone, false) : undefined },
          { label: t("ranked.farthest"), value: items[items.length - 1]?.label ?? "", note: items.length ? `${num((items[items.length - 1].ms - d.nowMs) / DAY_MS)} ${t("ranked.days")}` : undefined },
          { label: t("ranked.saved"), value: num(d.saved.length) },
          { label: t("ranked.legend"), value: t("ranked.legendValue"), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}
