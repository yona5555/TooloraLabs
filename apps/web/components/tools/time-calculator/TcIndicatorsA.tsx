"use client";
import { useTranslations } from "next-intl";
import { civilToUtcMs, findOffsetTransitions, zoneOffsetMinutes } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { ShiftDial } from "./TcDrawings";
import { useTcPhrases } from "./TcResult";
import { C, type CardProps } from "./state";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { svgPx } from "@/components/tool-ui/svgPx";
import { labelW } from "@/components/tool-ui/labelLayout";
import { useFitWidth } from "@/components/tool-ui/useFitWidth";
import { paletteTextClass } from "@/lib/palette-text";

const axisText = "fill-zinc-500 dark:fill-zinc-400";
const valueText = "fill-zinc-800 dark:fill-zinc-100";

export function useIndT() {
  return useTranslations("tools.time-calculator.tc.ind");
}

const hhmm = (sec: number) => `${String(Math.floor(sec / 3600)).padStart(2, "0")}:${String(Math.floor((sec % 3600) / 60)).padStart(2, "0")}`;

/* 1 · Shift dial (interactive: drag the start / end of the shift on a 24-hour ring) */
export function TcShiftDialCard({ s, set, d, f }: CardProps) {
  const t = useIndT();
  const { t: tc, dayTag, dst } = useTcPhrases();
  const sp = d.span;
  const nudge = (which: "start" | "end", by: number) => {
    const cur = which === "start" ? d.spanStart : d.spanEnd;
    set({ span: { ...s.span, [which]: hhmm((((cur + by) % 86400) + 86400) % 86400) } });
  };
  const btn = "rounded-md border border-zinc-300 px-2 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800";
  return (
    <SectionCard phoneRole="visual" title={t("dial.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("dial.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <div className="w-[300px] max-w-full">
            <ShiftDial
              size={300}
              start={d.spanStart}
              end={d.spanEnd}
              extraDays={Math.max(0, Math.floor((sp.wallSeconds - 1) / 86400))}
              dstDelta={sp.dstDeltaSeconds}
              hourLabel={(h) => (s.h12 ? `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "a" : "p"}` : String(h).padStart(2, "0"))}
              center={[tc("result.net"), f.durHm(sp.netSeconds), dst(sp.dstDeltaSeconds, f)]}
              startLabel="▶"
              endLabel="■"
              onDrag={(which, sec) => set({ span: { ...s.span, [which]: hhmm(sec) } })}
              ariaLabel={t("dial.title")}
            />
            <div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs" dir="ltr">
              {(["start", "end"] as const).map((w) => (
                <div key={w} className="flex items-center justify-center gap-1">
                  <button type="button" className={btn} onClick={() => nudge(w, -900)} aria-label="−15">−</button>
                  <span className={`min-w-[4.5rem] font-mono font-semibold ${paletteTextClass(w === "start" ? C.add : C.main)}`}>{f.clock(w === "start" ? d.spanStart : d.spanEnd)}</span>
                  <button type="button" className={btn} onClick={() => nudge(w, 900)} aria-label="+15">+</button>
                </div>
              ))}
            </div>
          </div>
        }
        rows={[
          { label: tc("input.start"), value: f.clock(d.spanStart), note: f.date(d.spanStartDate) },
          { label: tc("input.end"), value: f.clock(d.spanEnd), note: `${f.date(sp.endDate)} · ${dayTag(sp.dayOffset)}` },
          { label: tc("result.wall"), value: f.dur(sp.wallSeconds) },
          { label: tc("result.dstChange"), value: f.signedDur(sp.dstDeltaSeconds), note: dst(sp.dstDeltaSeconds, f) },
          { label: tc("result.break"), value: `−${f.dur(sp.breakSeconds)}` },
          { label: tc("result.net"), value: `${f.dur(sp.netSeconds)} · ${f.hours(sp.netSeconds)} h`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 2 · Timesheet composition (stacked segmented bar: additions, then subtractions back to the net) */
export function TcTimesheetStackCard({ s, d, f }: CardProps) {
  const t = useIndT();
  const { t: tc } = useTcPhrases();
  const sh = d.sheet;
  const [fitRef, W] = useFitWidth(420);
  const H = 190;
  const L = 10;
  const span = Math.max(1, sh.addedSeconds);
  const x = (sec: number) => L + (sec / span) * (W - 2 * L);
  const greens = ["#059669", "#10b981", "#34d399", "#047857", "#6ee7b7"];
  const pos = s.rows.map((r, i) => ({ r, i, v: d.rowSeconds[i] })).filter((e) => e.r.sign === 1);
  const neg = s.rows.map((r, i) => ({ r, i, v: d.rowSeconds[i] })).filter((e) => e.r.sign === -1);
  // Segment offsets: additions stack left → right, subtractions walk back from the gross total.
  const posStart = pos.map((_, k) => pos.slice(0, k).reduce((a, e) => a + e.v, 0));
  const negEnd = neg.map((_, k) => sh.addedSeconds - neg.slice(0, k).reduce((a, e) => a + e.v, 0));
  const net = Math.max(0, sh.totalSeconds);
  return (
    <SectionCard title={t("stack.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("stack.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <PhoneMini slot={0} title={t("stack.title")}>
            <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("stack.title")} className="max-w-full">
              <text style={{ fontSize: svgPx(12) }} x={L} y={18} fontWeight={700} fill={C.add}>{`+ ${f.dur(sh.addedSeconds)}`}</text>
              {pos.map((e, k) => {
                const x0 = x(posStart[k]);
                const w = Math.max(1, x(posStart[k] + e.v) - x0);
                return (
                  <g key={e.r.id}>
                    <rect x={x0} y={26} width={w} height={44} fill={greens[k % greens.length]} stroke="white" strokeWidth={1} style={{ transition: "all 350ms ease" }} />
                    {w > 38 && (
                      <>
                        <text style={{ fontSize: svgPx(12) }} x={x0 + w / 2} y={44} textAnchor="middle" fontWeight={700} fill="white">{(e.r.label || `#${e.i + 1}`).slice(0, 10)}</text>
                        <text style={{ fontSize: svgPx(12) }} x={x0 + w / 2} y={60} textAnchor="middle" fill="white">{f.durHm(e.v)}</text>
                      </>
                    )}
                  </g>
                );
              })}
              {neg.map((e, k) => {
                const x1 = x(negEnd[k]);
                const x0 = x(Math.max(0, negEnd[k] - e.v));
                return (
                  <g key={e.r.id}>
                    <rect x={x0} y={80} width={Math.max(1, x1 - x0)} height={30} fill={C.sub} fillOpacity={0.85} style={{ transition: "all 350ms ease" }} />
                    <text style={{ fontSize: svgPx(12) }} x={x0 - 4} y={99} textAnchor="end" fontWeight={700} fill={C.sub}>{`−${f.durHm(e.v)}`}</text>
                  </g>
                );
              })}
              <rect x={L} y={120} width={Math.max(1, x(net) - L)} height={30} rx={3} fill={C.main} style={{ transition: "all 350ms ease" }} />
              <text style={{ fontSize: svgPx(12) }} x={Math.min(W - 4 - labelW(f.dur(sh.totalSeconds)), x(net) + 6)} y={140} fontWeight={800} fill={C.main}>{f.dur(sh.totalSeconds)}</text>
              <line x1={x(net)} x2={x(net)} y1={22} y2={156} stroke={C.main} strokeDasharray="3 3" />
              {[0, 0.25, 0.5, 0.75, 1].map((q) => (
                <text style={{ fontSize: svgPx(12) }} key={q} x={x(span * q)} y={172} textAnchor={q === 0 ? "start" : q === 1 ? "end" : "middle"} className={axisText}>{f.durHm(span * q)}</text>
              ))}
            </svg>
          </PhoneMini>
        }
        rows={[
          ...pos.slice(0, 5).map((e) => ({ label: e.r.label || tc("input.entryN", { n: e.i + 1 }), value: f.dur(e.v), note: `${f.num((e.v / span) * 100, 1)}%` })),
          { label: tc("result.subtracted"), value: `−${f.dur(sh.subtractedSeconds)}`, note: t("stack.negCount", { n: neg.length }) },
          { label: tc("result.total"), value: `${f.dur(sh.totalSeconds)} · ${f.hours(sh.totalSeconds)} h`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 3 · Clock + duration flow (flow arrow with embedded numbers and day ribbon) */
export function TcFlowCard({ s, d, f }: CardProps) {
  const t = useIndT();
  const { t: tc, dayTag, zoneName } = useTcPhrases();
  const a = d.add;
  const W = 420;
  const H = 210;
  const sign = s.add.op === 1 ? "+" : "−";
  const days = Math.abs(a.dayOffset);
  const ribbon = Math.min(days + 1, 8);
  const firstMs = civilToUtcMs(a.dayOffset >= 0 ? d.addDate : a.resultDate);
  return (
    <SectionCard title={t("flow.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("flow.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("flow.title")} className="max-w-full">
            <rect x={6} y={30} width={110} height={70} rx={10} fill={C.add} fillOpacity={0.15} stroke={C.add} />
            <text style={{ fontSize: svgPx(17) }} x={61} y={58} textAnchor="middle" fontWeight={800} className={valueText}>{f.clock(d.addClock)}</text>
            <text style={{ fontSize: svgPx(12) }} x={61} y={78} textAnchor="middle" className={axisText}>{f.shortDate(d.addDate)}</text>
            <path d="M 122 65 L 286 65" stroke={C.main} strokeWidth={10} />
            <path d="M 284 50 L 304 65 L 284 80 Z" fill={C.main} />
            <text style={{ fontSize: svgPx(12) }} x={204} y={55} textAnchor="middle" fontWeight={800} fill={C.main}>{`${sign}${f.dur(d.addDuration)}`}</text>
            <text style={{ fontSize: svgPx(12) }} x={204} y={90} textAnchor="middle" className={axisText}>{`${f.hours(d.addDuration)} h`}</text>
            <rect x={306} y={30} width={108} height={70} rx={10} fill={C.main} fillOpacity={0.15} stroke={C.main} />
            <text style={{ fontSize: svgPx(17) }} x={360} y={58} textAnchor="middle" fontWeight={800} className={valueText}>{f.clock(a.resultClock)}</text>
            <text style={{ fontSize: svgPx(12) }} x={360} y={78} textAnchor="middle" className={axisText}>{f.shortDate(a.resultDate)}</text>
            <rect x={330} y={8} width={60} height={18} rx={9} fill={a.dayOffset ? C.ot : C.add} />
            <text style={{ fontSize: svgPx(12) }} x={360} y={21} textAnchor="middle" fontWeight={800} fill="white">{a.dayOffset > 0 ? `+${a.dayOffset}d` : a.dayOffset < 0 ? `${a.dayOffset}d` : "0d"}</text>
            {a.dstDeltaSeconds !== 0 && (
              <g>
                <rect x={150} y={100} width={110} height={20} rx={10} fill={C.dst} />
                <text style={{ fontSize: svgPx(12) }} x={205} y={114} textAnchor="middle" fontWeight={800} fill="white">{`DST ${f.signedDur(a.dstDeltaSeconds).replace(/:00$/, "")}`}</text>
              </g>
            )}
            {Array.from({ length: ribbon }, (_, i) => {
              const cw = (W - 12) / ribbon;
              const ms = firstMs + i * 86_400_000;
              const isStart = (a.dayOffset >= 0 ? 0 : days) === i;
              const isEnd = (a.dayOffset >= 0 ? days : 0) === i || (days >= ribbon && i === ribbon - 1);
              return (
                <g key={i}>
                  <rect x={6 + i * cw + 1} y={140} width={cw - 2} height={40} rx={6} fill={isEnd ? C.main : isStart ? C.add : "currentColor"} fillOpacity={isEnd || isStart ? 0.85 : 0.08} />
                  <text style={{ fontSize: svgPx(12) }} x={6 + i * cw + cw / 2} y={164} textAnchor="middle" fontWeight={700} className={isEnd || isStart ? "" : valueText} fill={isEnd || isStart ? "white" : undefined}>
                    {f.shortDate({ year: new Date(ms).getUTCFullYear(), month: new Date(ms).getUTCMonth() + 1, day: new Date(ms).getUTCDate() })}
                  </text>
                </g>
              );
            })}
            <text style={{ fontSize: svgPx(12) }} x={W / 2} y={198} textAnchor="middle" className={axisText}>{zoneName(d.zone)}</text>
          </svg>
        }
        rows={[
          { label: tc("input.start"), value: f.clock(d.addClock), note: f.date(d.addDate) },
          { label: tc("result.duration"), value: `${sign}${f.dur(d.addDuration)}` },
          { label: tc("result.naive"), value: f.clock(a.naiveClock), note: f.date(a.naiveDate) },
          { label: tc("result.dstChange"), value: f.signedDur(a.dstDeltaSeconds) },
          { label: tc("result.resultTime"), value: `${f.clock(a.resultClock)} · ${dayTag(a.dayOffset)}`, note: f.date(a.resultDate), emphasize: true },
        ]}
      />
    </SectionCard>
  );
}

/* 4 · DST timeline of the zone's year (timeline with stations + stepped UTC offset) */
export function TcDstTimelineCard({ d, f }: CardProps) {
  const t = useIndT();
  const { t: tc, zoneName } = useTcPhrases();
  const year = d.spanStartDate.year;
  const zone = d.zone;
  const trs = zone ? findOffsetTransitions(zone, year) : [];
  const y0 = Date.UTC(year, 0, 1);
  const y1 = Date.UTC(year + 1, 0, 1);
  const [fitRef, W] = useFitWidth(420);
  const H = 210;
  const L = 40;
  const Rr = 12;
  const x = (ms: number) => L + ((ms - y0) / (y1 - y0)) * (W - L - Rr);
  const offs = zone ? [zoneOffsetMinutes(y0, zone), ...trs.map((tr) => tr.offsetAfter)] : [0];
  const lo = Math.min(...offs) - 30;
  const hi = Math.max(...offs) + 30;
  const y = (m: number) => 40 + (1 - (m - lo) / Math.max(60, hi - lo)) * 80;
  const steps: { from: number; to: number; off: number }[] = [];
  let cur = y0;
  let off = offs[0];
  for (const tr of trs) {
    steps.push({ from: cur, to: tr.utcMs, off });
    cur = tr.utcMs;
    off = tr.offsetAfter;
  }
  steps.push({ from: cur, to: y1, off });
  const marker = Math.min(y1 - 1, Math.max(y0, d.span.startUtcMs));
  return (
    <SectionCard title={t("dstline.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("dstline.intro")}</p>
      <IndicatorWithTable
        workedExampleTitle={t("worked")}
        indicator={
          <svg ref={fitRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} role="img" aria-label={t("dstline.title")} className="max-w-full">
            {[...new Set(offs)].map((o) => (
              <text style={{ fontSize: svgPx(12) }} key={o} x={L - 4} y={y(o) + 3} textAnchor="end" className={axisText}>{f.offset(o)}</text>
            ))}
            {steps.map((st, i) => (
              <g key={i}>
                <rect x={x(st.from)} y={y(st.off)} width={Math.max(1, x(st.to) - x(st.from))} height={128 - y(st.off)} fill={st.off > Math.min(...offs) ? C.dst : C.main} fillOpacity={0.18} />
                <line x1={x(st.from)} x2={x(st.to)} y1={y(st.off)} y2={y(st.off)} stroke={C.main} strokeWidth={2.5} />
              </g>
            ))}
            <line x1={L} x2={W - Rr} y1={150} y2={150} stroke="currentColor" strokeOpacity={0.35} strokeWidth={2} />
            {Array.from({ length: 12 }, (_, m) => (
              <text style={{ fontSize: svgPx(12) }} key={m} x={x(Date.UTC(year, m, 15))} y={166} textAnchor="middle" className={axisText}>{f.month(m)}</text>
            ))}
            {trs.map((tr, i) => {
              const longer = tr.offsetAfter < tr.offsetBefore;
              return (
                <g key={i}>
                  <line x1={x(tr.utcMs)} x2={x(tr.utcMs)} y1={30} y2={150} stroke={C.dst} strokeDasharray="3 2" />
                  <circle cx={x(tr.utcMs)} cy={150} r={6} fill={C.dst} stroke="white" strokeWidth={1.5} />
                  <text style={{ fontSize: svgPx(12) }} x={x(tr.utcMs)} y={22} textAnchor="middle" fontWeight={800} fill={C.dst}>{longer ? "25h" : "23h"}</text>
                  <text style={{ fontSize: svgPx(12) }} x={x(tr.utcMs)} y={184} textAnchor="middle" fontWeight={700} className={valueText}>{f.instant(tr.utcMs, zone).split(",")[0]}</text>
                </g>
              );
            })}
            <g>
              <path d={`M ${x(marker)} 136 l -6 -10 h 12 Z`} fill={C.ot} />
              <text style={{ fontSize: svgPx(12) }} x={x(marker)} y={200} textAnchor="middle" fontWeight={700} fill={C.ot}>{tc("input.start")}</text>
            </g>
            {!trs.length && (
              <text style={{ fontSize: svgPx(12) }} x={(L + W) / 2} y={30} textAnchor="middle" fontWeight={700} className={valueText}>{zone ? t("dstline.noDst", { zone: zoneName(zone) }) : t("dstline.floating")}</text>
            )}
          </svg>
        }
        rows={[
          { label: tc("input.zone"), value: zoneName(zone), note: zone ? `UTC${f.offset(offs[0])} (${f.month(0)})` : undefined },
          ...trs.map((tr) => ({
            label: tr.offsetAfter < tr.offsetBefore ? t("dstline.back") : t("dstline.forward"),
            value: f.instant(tr.utcMs, zone),
            note: `UTC${f.offset(tr.offsetBefore)} → UTC${f.offset(tr.offsetAfter)} · ${tr.offsetAfter < tr.offsetBefore ? "25h" : "23h"}`,
          })),
          { label: t("dstline.thisSpan"), value: f.signedDur(d.span.dstDeltaSeconds), note: `${f.date(d.spanStartDate)} ${f.clock(d.spanStart)}`, emphasize: true },
        ]}
      />
    </SectionCard>
  );
}
