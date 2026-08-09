"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import DataSourceNote from "./DataSourceNote";
import type { ChartPeriod } from "./types";

type ForexHistoricalChartProps = {
  digitStyle: DigitStyle;
};

type RatePoint = { date: string; rate: number };

const PERIODS: ChartPeriod[] = [7, 30, 365];
const CHART_HEIGHT = 200;
const CHART_WIDTH = 640;
/** Fixed to the pair the tool highlights by default — see the page's above-the-fold spec. Frankfurter's ECB-sourced coverage (~30 currencies) doesn't overlap the full 161-currency converter list, so this chart intentionally isn't pair-selectable like the converter above it. */
const BASE = "USD";
const TARGET = "EUR";

export default function ForexHistoricalChart({ digitStyle }: ForexHistoricalChartProps) {
  const t = useTranslations("tools.forex-converter.chart");
  const [period, setPeriod] = useState<ChartPeriod>(30);
  const [points, setPoints] = useState<RatePoint[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const res = await fetch(`/api/forex/chart?base=${BASE}&target=${TARGET}&days=${period}`);
        const json = (await res.json()) as { points: RatePoint[] };
        if (!cancelled) {
          setPoints(json.points);
          setStatus("idle");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const { linePath, areaPath, minRate, maxRate } = useMemo(() => {
    if (points.length === 0) {
      return { linePath: "", areaPath: "", minRate: 0, maxRate: 0 };
    }
    const rates = points.map((p) => p.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const range = max - min || 1;

    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1 || 1)) * CHART_WIDTH;
      const y = CHART_HEIGHT - ((p.rate - min) / range) * CHART_HEIGHT;
      return `${x},${y}`;
    });

    const line = `M ${coords.join(" L ")}`;
    const area = `M 0,${CHART_HEIGHT} L ${coords.join(" L ")} L ${CHART_WIDTH},${CHART_HEIGHT} Z`;

    return { linePath: line, areaPath: area, minRate: min, maxRate: max };
  }, [points]);

  const rate = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p dir="ltr" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {BASE} / {TARGET}
        </p>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                period === p
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {t(p === 7 ? "periodWeek" : p === 30 ? "periodMonth" : "periodYear")}
            </button>
          ))}
        </div>
      </div>

      <div dir="ltr" className="mt-5 overflow-x-auto">
        {status === "loading" && <p className="py-10 text-center text-sm text-zinc-400">{t("loading")}</p>}
        {status === "error" && <p className="py-10 text-center text-sm text-red-500">{t("error")}</p>}
        {status === "idle" && points.length > 0 && (
          <>
            <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label={t("title")} className="h-56 w-full" style={{ minWidth: 480 }}>
              <path d={areaPath} className="fill-blue-600/10 dark:fill-blue-400/10" />
              <path d={linePath} fill="none" strokeWidth={2} className="stroke-blue-600 dark:stroke-blue-400" />
            </svg>
            <div className="mt-2 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                {t("lowLabel")}: {rate(minRate)}
              </span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {points[0]?.date} → {points[points.length - 1]?.date}
              </span>
              <span>
                {t("highLabel")}: {rate(maxRate)}
              </span>
            </div>
          </>
        )}
      </div>

      <DataSourceNote sourceKey="frankfurter" className="mt-4" />
    </SectionCard>
  );
}
