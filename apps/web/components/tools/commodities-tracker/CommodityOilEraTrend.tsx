"use client";
import { useTranslations } from "next-intl";
import { pairMilestones } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import LiveFallback from "@/components/tools/markets/LiveFallback";
import EventTrendChart from "@/components/tools/markets/EventTrendChart";
import { useMarketFormatters } from "@/components/tools/markets/fiat";
import { useFixingDate } from "@/components/tools/forex-converter/useForexData";
import { useSelectedCommodity } from "./commodityContext";
import { useCommodityHistory } from "./useCommodityData";

/** Supply and demand shocks the EIA daily series spans; each is pinned to the first close on or after its date. */
const EVENTS = [
  { key: "gulf", date: "1990-08-02" },
  { key: "asia", date: "1998-12-10" },
  { key: "peak2008", date: "2008-07-03" },
  { key: "opec2014", date: "2014-11-27" },
  { key: "negative", date: "2020-04-20" },
  { key: "ukraine", date: "2022-03-08" },
] as const;

/**
 * Supply and demand on real data (§31 type 7): the selected oil benchmark (Brent when Brent is
 * picked, WTI otherwise) since 1986, with the actual close on each supply or demand shock.
 */
export default function CommodityOilEraTrend() {
  const t = useTranslations("tools.commodities-tracker.education.pricing.live");
  const selected = useSelectedCommodity();
  const id = selected === "brent" ? "brent" : "wti";
  const name = id === "brent" ? "Brent" : "WTI";
  const h = useCommodityHistory(id);
  const f = useMarketFormatters("western");
  // EIA closes are USD; shown as such regardless of the display currency.
  const usd = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
  const date = useFixingDate();
  const points = h.status === "ready" ? h.data.points : [];
  const m = pairMilestones(points);
  const marks = EVENTS.flatMap((e) => {
    const p = points.find((pt) => pt.date >= e.date);
    return p ? [{ ...e, point: p }] : [];
  });

  return (
    <SectionCard id="oil-eras" title={t("title")} className="my-4 font-sans text-start">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading", { name })}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t(selected === "wti" || selected === "brent" ? "intro" : "introFallback")}</p>
      {!m ? (
        <LiveFallback status={h.status === "loading" ? "loading" : "error"} loading={t("loading")} error={t("error")} height={280} />
      ) : (
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1" dir="ltr">
            <EventTrendChart points={points} events={[...EVENTS]} formatValue={(v) => f.num(v, 2)} ariaLabel={t("heading", { name })} testId="oil-trend" />
          </div>
          <div className="lg:w-80 lg:shrink-0">
            <WorkedExampleNote
              title={t("workedTitle")}
              rows={[
                ...marks.map((e, i) => ({ label: `${i + 1}. ${t(`events.${e.key}`)}`, value: usd(e.point.rate), note: date(e.point.date) })),
                { label: t("today"), value: usd(m.last.rate), emphasize: true, note: date(m.last.date) },
              ]}
            />
          </div>
        </div>
      )}
    </SectionCard>
  );
}
