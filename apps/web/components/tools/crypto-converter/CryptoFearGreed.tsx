"use client";
import { useLocale, useTranslations } from "next-intl";
import { FEAR_GREED_ZONES, fearGreedZone, mean, type FearGreedZone } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import type { FearGreedPoint } from "@/lib/crypto/network";
import { useNetworkData } from "./useCryptoLive";
import LiveFallback from "@/components/tools/markets/LiveFallback";

const ZONE_BG: Record<FearGreedZone, string> = {
  extremeFear: "bg-red-600",
  fear: "bg-orange-500",
  neutral: "bg-yellow-400",
  greed: "bg-lime-500",
  extremeGreed: "bg-emerald-600",
};

export default function CryptoFearGreed() {
  const t = useTranslations("tools.crypto-converter.fearGreed");
  const locale = useLocale();
  const state = useNetworkData<FearGreedPoint[]>("fng", 15 * 60_000);

  const points = state.status === "ready" ? state.data.slice(-30) : [];
  const today = points[points.length - 1];
  const yesterday = points[points.length - 2];
  const weekAgo = points[points.length - 8];
  const values = points.map((p) => p.value);
  const date = (ts: number) => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" }).format(ts * 1000);
  const signed = (v: number) => `${v > 0 ? "+" : ""}${v}`;

  return (
    <SectionCard id="fear-greed" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading")}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      {state.status !== "ready" || !today ? (
        <LiveFallback status={state.status === "error" ? "error" : "loading"} loading={t("loading")} error={t("error")} height={240} />
      ) : (
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1" dir="ltr">
            {/* Current value pinned on the five published bands */}
            <div className="relative pt-12">
              <div
                className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${Math.min(95, Math.max(5, today.value))}%` }}
                data-testid="fng-marker"
              >
                <span className="rounded-md bg-zinc-900 px-2 py-0.5 font-mono text-lg font-bold text-white dark:bg-white dark:text-zinc-900">
                  {today.value}
                </span>
                <span className="h-3 w-0.5 bg-zinc-900 dark:bg-white" />
              </div>
              <div className="flex h-5 overflow-hidden rounded-full">
                {FEAR_GREED_ZONES.map((z) => (
                  <div key={z.zone} className={ZONE_BG[z.zone]} style={{ width: `${z.max - z.min + 1}%` }} />
                ))}
              </div>
              <div className="mt-1.5 flex text-[10px] leading-3 text-zinc-600 dark:text-zinc-300">
                {FEAR_GREED_ZONES.map((z) => (
                  <div key={z.zone} className="px-0.5 text-center" style={{ width: `${z.max - z.min + 1}%` }}>
                    <div className="font-semibold">{t(`zones.${z.zone}`)}</div>
                    <div className="font-mono text-zinc-400">
                      {z.min}–{z.max}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 30-day history, one cell per day coloured by its band */}
            <p className="mt-5 text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("historyLabel", { days: points.length })}</p>
            <div className="mt-1.5 flex h-10 items-end gap-0.5" data-testid="fng-history">
              {points.map((p) => (
                <div
                  key={p.timestamp}
                  title={`${date(p.timestamp)}: ${p.value}`}
                  className={`flex-1 rounded-sm ${ZONE_BG[fearGreedZone(p.value)]}`}
                  style={{ height: `${Math.max(8, p.value)}%` }}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-400">
              <span>{date(points[0].timestamp)}</span>
              <span>{date(today.timestamp)}</span>
            </div>
          </div>

          <div className="lg:w-64">
            <WorkedExampleNote
              title={t("workedTitle")}
              rows={[
                { label: t("today"), value: `${today.value} · ${t(`zones.${fearGreedZone(today.value)}`)}` },
                ...(yesterday ? [{ label: t("yesterday"), value: `${yesterday.value} (${signed(today.value - yesterday.value)})` }] : []),
                ...(weekAgo ? [{ label: t("weekAgo"), value: `${weekAgo.value} (${signed(today.value - weekAgo.value)})` }] : []),
                { label: t("low"), value: String(Math.min(...values)) },
                { label: t("high"), value: String(Math.max(...values)) },
                {
                  label: t("average", { days: points.length }),
                  value: mean(values).toFixed(1),
                  emphasize: true,
                  note: t("averageNote", { days: points.length }),
                },
              ]}
            />
          </div>
        </div>
      )}
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{t("source")}</p>
    </SectionCard>
  );
}
