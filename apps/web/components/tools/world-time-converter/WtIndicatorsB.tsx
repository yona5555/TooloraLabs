"use client";
import { useMemo } from "react";
import { Briefcase, Check, Coffee } from "lucide-react";
import {
  civilToUtcMs,
  hijriMonthLength,
  wtSharedWorkdays,
  wtSunTimes,
  wtTransitionsBetween,
  wtWeekendDays,
  zonedParts,
} from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { useDuration, useIndT, useUnitT } from "./WtIndicatorsA";
import type { CardProps } from "./state";
import { px2 } from "@/components/tool-ui/indicator-kit/SvgBits";
import { svgPx } from "@/components/tool-ui/svgPx";
import { useFitWidth } from "@/components/tool-ui/useFitWidth";

const axisText = "fill-zinc-500 dark:fill-zinc-400";
const valueText = "fill-zinc-800 dark:fill-zinc-100";
const shortName = (s: string) => s.split(" / ")[0];
const DAY = 86_400_000;

/* 5 · Upcoming clock changes over the next 12 months (timeline with stations) */
export function WtDstTimelineCard({ d, f }: CardProps) {
  const t = useIndT();
  const tu = useUnitT();
  const start = d.conv.utcMs;
  const end = start + 365 * DAY;
  const rows = useMemo(() => d.all.map((c) => ({ c, tr: wtTransitionsBetween(c.zone, start, end) })), [d.all, start, end]);
  const [fitRef, W] = useFitWidth(560);
  const L = 110;
  const RH = 30;
  const T = 26;
  const H = T + rows.length * RH + 8;
  const x = (ms: number) => L + ((ms - start) / (end - start)) * (W - L - 16);
  const months = Array.from({ length: 13 }, (_, i) => {
    const p = zonedParts(start, "UTC");
    return Date.UTC(p.year, p.month - 1 + i, 1);
  }).filter((ms) => ms > start && ms < end);
  const upcoming = rows
    .flatMap((r) => r.tr.slice(0, 1).map((tr) => ({ c: r.c, tr })))
    .sort((a, b) => a.tr.utcMs - b.tr.utcMs);
  // Local clock reading at the transition instant, before and after the change.
  const wall = (tr: { utcMs: number }, offset: number) => {
    const u = zonedParts(tr.utcMs, "UTC");
    return f.hhmm(u.hour * 60 + u.minute + offset);
  };

  return (
    <SectionCard title={t("dst.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("dst.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg viewBox={`0 0 ${W} ${H}`} ref={fitRef} width={W} height={H} style={{ direction: "ltr" }} className="h-auto max-w-full" role="img" aria-label={t("dst.title")}>
            {months.map((ms) => (
              <g key={ms}>
                <line x1={x(ms)} x2={x(ms)} y1={T - 6} y2={H - 6} stroke="currentColor" strokeOpacity={0.1} />
                <text style={{ fontSize: svgPx(12) }} x={x(ms) + 2} y={T - 10} className={axisText}>{f.month(ms)}</text>
              </g>
            ))}
            <line x1={x(start)} x2={x(start)} y1={T - 8} y2={H - 6} stroke="#2563eb" strokeWidth={2} />
            <text style={{ fontSize: svgPx(12) }} x={x(start) + 3} y={H - 8} fontWeight={700} fill="#2563eb">{t("dst.today")}</text>
            {rows.map((r, i) => {
              const yy = T + i * RH + RH / 2;
              return (
                <g key={r.c.id}>
                  <text style={{ fontSize: svgPx(12) }} x={L - 8} y={yy + 3} textAnchor="end" fontWeight={i === 0 ? 800 : 600} className={valueText}>{shortName(f.city(r.c)).slice(0, 15)}</text>
                  <line x1={L} x2={W - 16} y1={yy} y2={yy} stroke="currentColor" strokeOpacity={r.tr.length ? 0.35 : 0.12} strokeDasharray={r.tr.length ? undefined : "3 4"} />
                  {r.tr.length === 0 && <text style={{ fontSize: svgPx(12) }} x={L + 6} y={yy - 4} className={axisText}>{t("dst.none")}</text>}
                  {r.tr.map((tr) => {
                    const fwd = tr.offsetAfter > tr.offsetBefore;
                    return (
                      <g key={tr.utcMs}>
                        <circle cx={x(tr.utcMs)} cy={yy} r={6} fill={fwd ? "#f59e0b" : "#3b82f6"} stroke="white" strokeWidth={1.5} />
                        <text style={{ fontSize: svgPx(12) }} x={x(tr.utcMs)} y={yy - 9} textAnchor="middle" fontWeight={700} fill={fwd ? "#b45309" : "#1d4ed8"}>
                          {f.shortDate(tr.utcMs, r.c.zone)} {fwd ? "+" : "−"}{f.num(Math.abs(tr.offsetAfter - tr.offsetBefore) / 60)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        }
        rows={
          upcoming.length
            ? [
                ...upcoming.slice(0, 6).map(({ c, tr }) => ({
                  label: shortName(f.city(c)),
                  value: `${f.date(tr.utcMs, c.zone)}`,
                  note: `${wall(tr, tr.offsetBefore)} → ${wall(tr, tr.offsetAfter)} (${tu("h", { n: f.signed((tr.offsetAfter - tr.offsetBefore) / 60) })})`,
                })),
                { label: t("dst.rowNoDst"), value: `${rows.filter((r) => r.tr.length === 0).length} / ${rows.length}`, emphasize: true },
              ]
            : [{ label: t("dst.rowNoDst"), value: `${rows.length} / ${rows.length}`, emphasize: true }]
        }
      />
    </SectionCard>
  );
}

/* 6 · Hijri date in each city (side-by-side equivalence + Hijri month strip) */
export function WtHijriCard({ d, f }: CardProps) {
  const t = useIndT();
  const ms = d.conv.utcMs;
  const home = d.conv.rows[0];
  const len = useMemo(() => hijriMonthLength(home.hijri.year, home.hijri.month), [home.hijri.year, home.hijri.month]);
  // Group cities by their local date (they can straddle the date line).
  const groups = new Map<string, { utc: number; zone: string; hijriDay: number; delta: number; names: string[] }>();
  d.all.forEach((c, i) => {
    const r = d.conv.rows[i];
    const key = `${r.parts.year}-${r.parts.month}-${r.parts.day}`;
    const g = groups.get(key) ?? { utc: ms, zone: c.zone, hijriDay: r.hijri.day, delta: r.dayDelta, names: [] };
    g.names.push(shortName(f.city(c)));
    groups.set(key, g);
  });
  const list = [...groups.values()].sort((a, b) => a.delta - b.delta);
  const [fitRef, W] = useFitWidth(470);
  const CW = (W - 20) / 30;
  const g0 = civilToUtcMs(home.parts) + 12 * 3_600_000;
  const toNext = len - home.hijri.day + 1;

  return (
    <SectionCard title={t("hijri.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("hijri.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-full max-w-[470px] space-y-3">
            <svg viewBox={`0 0 ${W} 64`} ref={fitRef} width={W} height={64} style={{ direction: "ltr" }} className="h-auto max-w-full" role="img" aria-label={t("hijri.strip")}>
              <text style={{ fontSize: svgPx(12) }} x={10} y={11} fontWeight={700} className={valueText}>{f.hijriMonth(g0)} {home.hijri.year}</text>
              {Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                const inMonth = day <= len;
                const mark = list.find((g) => g.hijriDay === day);
                return (
                  <g key={day}>
                    <rect x={10 + i * CW} y={18} width={CW - 2} height={24} rx={3} fill={!inMonth ? "transparent" : mark ? (day === home.hijri.day ? "#059669" : "#34d399") : "#e4e4e7"} className={!inMonth || mark ? "" : "dark:fill-zinc-700"} stroke={!inMonth ? "currentColor" : "none"} strokeOpacity={0.2} strokeDasharray="2 2" />
                    {(day === 1 || day % 5 === 0 || mark) && inMonth && (
                      <text style={{ fontSize: svgPx(12) }} x={10 + i * CW + (CW - 2) / 2} y={34} textAnchor="middle" fontWeight={700} fill={mark ? "white" : undefined} className={mark ? "" : axisText}>{day}</text>
                    )}
                  </g>
                );
              })}
              <text style={{ fontSize: svgPx(12) }} x={10} y={58} className={axisText}>{t("hijri.stripNote", { n: len })}</text>
            </svg>
            <ul className="space-y-1.5">
              {list.map((g) => (
                <li key={g.delta} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-lg bg-zinc-50 p-2 text-sm dark:bg-zinc-800/60" data-bp-inner>
                  <span className="rounded-md bg-blue-100 px-2 py-1 text-center font-semibold text-blue-800 dark:bg-blue-500/20 dark:text-blue-200">{f.date(g.utc, g.zone)}</span>
                  <span className="font-bold text-zinc-400">=</span>
                  <span className="rounded-md bg-emerald-100 px-2 py-1 text-center font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">{f.hijri(g.utc, g.zone)}</span>
                  <span className="col-span-3 truncate text-xs text-zinc-500 dark:text-zinc-400">{g.names.join(" · ")}</span>
                </li>
              ))}
            </ul>
          </div>
        }
        rows={[
          { label: t("hijri.rowGreg", { city: shortName(f.city(d.from)) }), value: f.date(ms, d.from.zone) },
          { label: t("hijri.rowHijri"), value: f.hijri(ms, d.from.zone) },
          { label: t("hijri.rowNumeric"), value: `${home.hijri.day}/${home.hijri.month}/${home.hijri.year}` },
          { label: t("hijri.rowLen"), value: t("hijri.days", { n: len }) },
          { label: t("hijri.rowNext"), value: t("hijri.days", { n: toNext }) },
          { label: t("hijri.rowDates"), value: String(list.length), emphasize: true, note: t("hijri.rowDatesNote") },
        ]}
      />
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("hijri.limit")}</p>
    </SectionCard>
  );
}

/* 7 · Daylight in each city today (stacked segmented bars on a 24-hour local axis) */
export function WtDaylightCard({ s, d, f, now }: CardProps) {
  const t = useIndT();
  const dur = useDuration();
  const rows = d.all.map((c, i) => {
    const r = d.conv.rows[i];
    const st = wtSunTimes(c.lat, c.lon, r.parts, r.offsetMinutes);
    const nowP = zonedParts(now, c.zone);
    return { c, st, nowMin: nowP.hour * 60 + nowP.minute };
  });
  const [fitRef, W] = useFitWidth(520);
  const L = 110;
  const RH = 26;
  const T = 18;
  const H = T + rows.length * RH + 6;
  // Rounded: sun times come from trig whose last digits differ between server and browser (hydration).
  const X = (m: number) => px2(L + (Math.max(0, Math.min(1440, m)) / 1440) * (W - L - 8));
  const seg = (a: number | null, b: number | null) => (a === null || b === null ? null : [a, b] as const);
  const sorted = [...rows].sort((a, b) => b.st.dayLengthMin - a.st.dayLengthMin);
  const home = rows[0];

  return (
    <SectionCard title={t("daylight.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("daylight.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg viewBox={`0 0 ${W} ${H}`} ref={fitRef} width={W} height={H} style={{ direction: "ltr" }} className="h-auto max-w-full" role="img" aria-label={t("daylight.title")}>
            {[0, 360, 720, 1080, 1440].map((m) => (
              <g key={m}>
                <line x1={X(m)} x2={X(m)} y1={T - 4} y2={H - 4} stroke="currentColor" strokeOpacity={0.12} />
                <text style={{ fontSize: svgPx(12) }} x={X(m)} y={T - 6} textAnchor="middle" className={axisText}>{m === 1440 ? "24:00" : f.hhmm(m)}</text>
              </g>
            ))}
            {rows.map((r, i) => {
              const y = T + i * RH + 3;
              const h = RH - 8;
              const civil1 = seg(r.st.civilDawn, r.st.sunrise);
              const day = r.st.polar === "day" ? ([0, 1440] as const) : seg(r.st.sunrise, r.st.sunset);
              const civil2 = seg(r.st.sunset, r.st.civilDusk);
              return (
                <g key={r.c.id}>
                  <text style={{ fontSize: svgPx(12) }} x={L - 6} y={y + h / 2 + 3} textAnchor="end" fontWeight={i === 0 ? 800 : 600} className={valueText}>{shortName(f.city(r.c)).slice(0, 15)}</text>
                  <rect x={X(0)} y={y} width={X(1440) - X(0)} height={h} rx={3} fill="#1e293b" />
                  {civil1 && <rect x={X(civil1[0])} y={y} width={X(civil1[1]) - X(civil1[0])} height={h} fill="#818cf8" />}
                  {civil2 && <rect x={X(civil2[0])} y={y} width={X(civil2[1]) - X(civil2[0])} height={h} fill="#818cf8" />}
                  {day && <rect x={X(day[0])} y={y} width={X(day[1]) - X(day[0])} height={h} fill="#fcd34d" style={{ transition: "all 400ms ease" }} />}
                  <rect x={X(s.ws)} y={y - 1} width={X(s.we) - X(s.ws)} height={h + 2} fill="none" stroke="#10b981" strokeWidth={1.5} rx={2} />
                  <circle cx={X(r.nowMin)} cy={y + h / 2} r={3.5} fill="#ef4444" stroke="white" strokeWidth={1} />
                  {day && r.st.polar === null && (
                    <text style={{ fontSize: svgPx(12) }} x={(X(day[0]) + X(day[1])) / 2} y={y + h / 2 + 3} textAnchor="middle" fontWeight={700} fill="#78350f">{dur(r.st.dayLengthMin)}</text>
                  )}
                </g>
              );
            })}
          </svg>
        }
        rows={[
          {
            label: t("daylight.rowSun", { city: shortName(f.city(home.c)) }),
            value: home.st.sunrise !== null && home.st.sunset !== null ? `${f.hhmm(home.st.sunrise)} – ${f.hhmm(home.st.sunset)}` : t(home.st.polar === "day" ? "map.polarDay" : "map.polarNight"),
          },
          { label: t("daylight.rowNoon"), value: f.hhmm(home.st.solarNoon), note: t("daylight.rowNoonNote") },
          { label: t("daylight.rowLength"), value: dur(home.st.dayLengthMin) },
          { label: t("daylight.rowTwilight"), value: dur(home.st.civilTwilightMin) },
          { label: t("daylight.rowLongest"), value: `${shortName(f.city(sorted[0].c))} ${dur(sorted[0].st.dayLengthMin)}` },
          { label: t("daylight.rowShortest"), value: `${shortName(f.city(sorted[sorted.length - 1].c))} ${dur(sorted[sorted.length - 1].st.dayLengthMin)}`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 8 · Workweek comparison (icon comparison rows: Fri–Sat vs Sat–Sun weekends) */
export function WtWeekCard({ d, f }: CardProps) {
  const t = useIndT();
  const dur = useDuration();
  const order = [1, 2, 3, 4, 5, 6, 0];
  const weekends = d.all.map((c) => wtWeekendDays(c.weekend));
  const shared = wtSharedWorkdays(weekends);
  const weekly = d.week.reduce((sum, w) => sum + w.minutes, 0);
  const friSat = d.all.filter((c) => c.weekend === "fri-sat").map((c) => shortName(f.city(c)));
  const satSun = d.all.filter((c) => c.weekend === "sat-sun").map((c) => shortName(f.city(c)));
  const thuFri = d.all.filter((c) => c.weekend === "thu-fri").map((c) => shortName(f.city(c)));

  return (
    <SectionCard title={t("week.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("week.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-full max-w-[520px] overflow-x-auto">
            <table className="w-full border-separate border-spacing-1 text-xs">
              <thead>
                <tr>
                  <th />
                  {order.map((dd) => (
                    <th key={dd} className="font-semibold text-zinc-600 dark:text-zinc-300">{f.dayName(dd)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.all.map((c, i) => {
                  const today = d.conv.rows[i].weekday;
                  return (
                    <tr key={c.id}>
                      <th className={`max-w-[110px] truncate pe-1 text-start ${i === 0 ? "font-extrabold" : "font-semibold"} text-zinc-800 dark:text-zinc-100`}>{shortName(f.city(c))}</th>
                      {order.map((dd) => {
                        const off = weekends[i].includes(dd);
                        return (
                          <td key={dd} className={`h-8 rounded-md text-center ${off ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"} ${dd === today ? "ring-2 ring-blue-500" : ""}`}>
                            {off ? <Coffee size={13} className="mx-auto" /> : <Briefcase size={13} className="mx-auto" />}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr>
                  <th className="pe-1 text-start font-bold text-blue-700 dark:text-blue-300">{t("week.shared")}</th>
                  {order.map((dd) => (
                    <td key={dd} className={`h-8 rounded-md text-center ${shared.includes(dd) ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"}`}>
                      {shared.includes(dd) ? <Check size={13} className="mx-auto" /> : "–"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{t("week.legend")}</p>
          </div>
        }
        rows={[
          { label: t("week.rowShared"), value: shared.length ? shared.map((x) => f.dayName(x)).join(" · ") : t("meet.none"), note: t("week.rowSharedNote", { n: shared.length }) },
          ...(friSat.length ? [{ label: t("week.friSat"), value: friSat.join(", ") }] : []),
          ...(satSun.length ? [{ label: t("week.satSun"), value: satSun.join(", ") }] : []),
          ...(thuFri.length ? [{ label: t("week.thuFri"), value: thuFri.join(", ") }] : []),
          ...d.week.slice(0, 7).map((w) => ({ label: f.date(civilToUtcMs(w.date) + 12 * 3_600_000, "UTC"), value: dur(w.minutes) })),
          { label: t("week.rowWeekly"), value: dur(weekly), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}
