"use client";
import { useTranslations } from "next-intl";
import { pairMilestones, type DailyRate } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import LiveFallback from "@/components/tools/markets/LiveFallback";
import { useMarketFormatters } from "@/components/tools/markets/fiat";
import { hasEcbHistory } from "@/lib/forex/ecb";
import { useForexPair } from "./forexPairContext";
import { useFixingDate, usePairHistory } from "./useForexData";

/** Floating-era events the ECB series spans; each is pinned to the first fixing on or after its date. */
const EVENTS = [
  { key: "euro", date: "1999-01-04" },
  { key: "notes", date: "2002-01-02" },
  { key: "lehman", date: "2008-09-15" },
  { key: "snb", date: "2015-01-15" },
  { key: "brexit", date: "2016-06-24" },
  { key: "covid", date: "2020-03-16" },
  { key: "hikes", date: "2022-07-21" },
] as const;

const W = 720;
const H = 380;
const PAD = { l: 44, r: 8, t: 14, b: 40 };

/**
 * Trend line with highlighted reference points (§31 type 7): the converter's own pair across the
 * floating-rate era, with the real fixing on each landmark date. Falls back to EUR/USD when the
 * ECB doesn't fix one of the converter's currencies.
 */
export default function ForexFloatingEraTrend() {
  const t = useTranslations("tools.forex-converter.education.history.live");
  const pair = useForexPair();
  const covered = pair.from !== pair.to && hasEcbHistory(pair.from) && hasEcbHistory(pair.to);
  const [base, quote] = covered ? [pair.from, pair.to] : ["EUR", "USD"];
  const history = usePairHistory(base, quote);
  const f = useMarketFormatters("western");
  const date = useFixingDate();

  const points: DailyRate[] = history.status === "ready" ? history.data : [];
  // One point per ~week keeps the path light; extremes stay exact via pairMilestones.
  const step = Math.max(1, Math.floor(points.length / 600));
  const path = points.filter((_, i) => i % step === 0 || i === points.length - 1);
  const m = pairMilestones(points);
  const t0 = points.length ? Date.parse(points[0].date) : 0;
  const t1 = points.length ? Date.parse(points[points.length - 1].date) : 1;
  const lo = m?.low.rate ?? 0;
  const hi = m?.high.rate ?? 1;
  const x = (d: string) => PAD.l + ((Date.parse(d) - t0) / (t1 - t0 || 1)) * (W - PAD.l - PAD.r);
  const y = (r: number) => PAD.t + (1 - (r - lo) / (hi - lo || 1)) * (H - PAD.t - PAD.b);
  const marks = EVENTS.flatMap((e) => {
    const p = points.find((pt) => pt.date >= e.date);
    return p ? [{ ...e, point: p }] : [];
  });
  const last = points[points.length - 1];

  return (
    <SectionCard id="floating-era" title={t("title")} className="my-4 font-sans text-start">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading", { base, quote })}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{covered ? t("intro") : t("introFallback", { from: pair.from, to: pair.to })}</p>
      {history.status !== "ready" || !m || !last ? (
        <LiveFallback status={history.status === "loading" ? "loading" : "error"} loading={t("loading")} error={t("error")} height={240} />
      ) : (
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 overflow-x-auto" dir="ltr">
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={t("heading", { base, quote })} data-testid="era-trend">
              {/* Year axis and the all-time range on the value axis. */}
              {Array.from({ length: 30 }, (_, i) => 2000 + i * 5)
                .filter((yr) => Date.parse(`${yr}-01-01`) > t0 && Date.parse(`${yr}-01-01`) < t1)
                .map((yr) => (
                  <text key={yr} x={x(`${yr}-01-01`)} y={H - 22} textAnchor="middle" className="fill-zinc-400 font-mono text-[10px]">
                    {yr}
                  </text>
                ))}
              {[m.high, m.low].map((mk) => (
                <g key={mk.date}>
                  <line x1={PAD.l} x2={W - PAD.r} y1={y(mk.rate)} y2={y(mk.rate)} strokeDasharray="2 4" className="stroke-zinc-300 dark:stroke-zinc-600" />
                  <text x={PAD.l - 4} y={y(mk.rate) + 3} textAnchor="end" className="fill-zinc-500 font-mono text-[10px] dark:fill-zinc-400">
                    {f.rate(mk.rate)}
                  </text>
                </g>
              ))}
              <path d={`M ${path.map((p) => `${x(p.date).toFixed(1)},${y(p.rate).toFixed(1)}`).join(" L ")}`} fill="none" strokeWidth={1.5} className="stroke-blue-600 dark:stroke-blue-400" />
              {marks.map((e, i) => (
                <g key={e.key}>
                  <line x1={x(e.point.date)} x2={x(e.point.date)} y1={PAD.t} y2={H - PAD.b} strokeDasharray="3 3" className="stroke-zinc-300 dark:stroke-zinc-600" />
                  <circle cx={x(e.point.date)} cy={y(e.point.rate)} r={4.5} className="fill-amber-500 stroke-white dark:stroke-zinc-900" strokeWidth={1.5} />
                  <text x={x(e.point.date)} y={H - 6} textAnchor="middle" className="fill-amber-600 font-mono text-[11px] font-bold dark:fill-amber-400">
                    {i + 1}
                  </text>
                </g>
              ))}
              <circle cx={x(last.date)} cy={y(last.rate)} r={4.5} className="fill-blue-600" />
            </svg>
          </div>
          <div className="lg:w-80 lg:shrink-0">
            <WorkedExampleNote
              title={t("workedTitle")}
              rows={[
                ...marks.map((e, i) => ({
                  label: `${i + 1}. ${t(`events.${e.key}`)}`,
                  value: f.rate(e.point.rate),
                  note: date(e.point.date),
                })),
                { label: t("today"), value: f.rate(last.rate), emphasize: true, note: t("sinceFirst", { pct: f.signedPct((last.rate / points[0].rate - 1) * 100) }) },
              ]}
            />
          </div>
        </div>
      )}
    </SectionCard>
  );
}
