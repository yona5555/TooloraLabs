"use client";
import { useTranslations } from "next-intl";
import { pairMilestones, type DailyRate } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import LiveFallback from "@/components/tools/markets/LiveFallback";
import EventTrendChart from "@/components/tools/markets/EventTrendChart";
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
  const m = pairMilestones(points);
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
            <EventTrendChart points={points} events={[...EVENTS]} formatValue={f.rate} ariaLabel={t("heading", { base, quote })} testId="era-trend" />
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
