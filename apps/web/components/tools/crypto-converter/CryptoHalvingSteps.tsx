"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { HALVING_INTERVAL, blockRewardAtHeight, halvingCountdown } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import type { ChainTip } from "@/lib/crypto/network";
import { useNetworkData } from "./useCryptoLive";
import LiveFallback from "./LiveFallback";

/** Genesis plus the four halvings so far, with the UTC date each era's first block was mined. */
const ERA_STARTS = [
  { height: 0, date: "2009-01-03" },
  { height: 210_000, date: "2012-11-28" },
  { height: 420_000, date: "2016-07-09" },
  { height: 630_000, date: "2020-05-11" },
  { height: 840_000, date: "2024-04-20" },
];

const W = 560;
const H = 230;
const PAD = { top: 26, right: 12, bottom: 34, left: 12 };

function splitDuration(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

export default function CryptoHalvingSteps() {
  const t = useTranslations("tools.crypto-converter.halving");
  const locale = useLocale();
  const state = useNetworkData<ChainTip>("tip", 60_000);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const num = (v: number, max = 0) => formatLocalizedNumber(v, "western", { maximumFractionDigits: max });
  const fmtDate = (ms: number) => new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(ms);

  if (state.status !== "ready") {
    return (
      <SectionCard id="halving" title={t("title")}>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading")}</h3>
        <LiveFallback status={state.status} loading={t("loading")} error={t("error")} height={260} />
      </SectionCard>
    );
  }

  const tip = state.data;
  const c = halvingCountdown(tip.height, tip.timestamp, tip.avgBlockSeconds);
  const left = splitDuration(c.estimatedTime - now / 1000);
  const eras = [
    ...ERA_STARTS.map((e) => ({ ...e, time: Date.parse(e.date), estimated: false })),
    { height: c.nextHeight, date: "", time: c.estimatedTime * 1000, estimated: true },
  ];
  const currentEra = Math.floor(tip.height / HALVING_INTERVAL);

  // Each era is one equal-width step; step height is the reward (linear, 50 BTC at the top).
  const stepW = (W - PAD.left - PAD.right) / eras.length;
  const y = (reward: number) => PAD.top + (1 - reward / 50) * (H - PAD.top - PAD.bottom);
  const base = H - PAD.bottom;

  return (
    <SectionCard id="halving" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading")}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <div dir="ltr" className="grid grid-cols-4 gap-2 text-center" data-testid="halving-countdown">
            {(["days", "hours", "minutes", "seconds"] as const).map((k) => (
              <div key={k} className="rounded-lg bg-blue-50 py-1.5 dark:bg-blue-500/10">
                <div className="font-mono text-xl font-bold tabular-nums text-blue-700 dark:text-blue-300">{num(left[k])}</div>
                <div className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400">{t(`units.${k}`)}</div>
              </div>
            ))}
          </div>

          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto max-w-full" role="img" aria-label={t("heading")}>
            {eras.map((e, i) => {
              const reward = blockRewardAtHeight(e.height);
              const x = PAD.left + i * stepW;
              const isCurrent = i === currentEra;
              const fillClass = e.estimated
                ? "fill-none stroke-blue-400 dark:stroke-blue-500"
                : isCurrent
                  ? "fill-blue-200 dark:fill-blue-900/70"
                  : "fill-blue-500/80 dark:fill-blue-600/80";
              return (
                <g key={e.height}>
                  <rect
                    x={x + 2}
                    y={y(reward)}
                    width={stepW - 4}
                    height={Math.max(2, base - y(reward))}
                    rx={3}
                    className={fillClass}
                    strokeDasharray={e.estimated ? "4 3" : undefined}
                    strokeWidth={e.estimated ? 1.5 : 0}
                  />
                  {isCurrent && (
                    <rect
                      x={x + 2}
                      y={y(reward)}
                      width={((stepW - 4) * c.eraProgress) / 100}
                      height={Math.max(2, base - y(reward))}
                      rx={3}
                      className="fill-blue-600 dark:fill-blue-400"
                    />
                  )}
                  <text x={x + stepW / 2} y={y(reward) - 7} textAnchor="middle" className="fill-zinc-800 font-mono text-[11px] font-semibold dark:fill-zinc-100">
                    {num(reward, 4)}
                  </text>
                  <text x={x + stepW / 2} y={base + 13} textAnchor="middle" className="fill-zinc-500 font-mono text-[10px] dark:fill-zinc-400">
                    {e.estimated ? `~${new Date(e.time).getUTCFullYear()}` : e.date.slice(0, 4)}
                  </text>
                  <text x={x + stepW / 2} y={base + 26} textAnchor="middle" className="fill-zinc-400 font-mono text-[9px] dark:fill-zinc-500">
                    #{num(e.height)}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{t("legend", { progress: num(c.eraProgress, 1) })}</p>
        </div>

        <div className="lg:w-64">
          <WorkedExampleNote
            title={t("workedTitle")}
            rows={[
              { label: t("rowTip"), value: `#${num(tip.height)}` },
              { label: t("rowNext"), value: `#${num(c.nextHeight)}` },
              { label: t("rowBlocks"), value: num(c.blocksRemaining) },
              { label: t("rowAvg"), value: `× ${num(tip.avgBlockSeconds, 1)} s`, note: t("rowAvgNote") },
              { label: t("rowReward"), value: `${num(c.currentReward, 4)} → ${num(c.nextReward, 4)} BTC` },
              { label: t("rowDate"), value: fmtDate(c.estimatedTime * 1000), emphasize: true, note: t("rowDateNote") },
            ]}
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{t("source")}</p>
    </SectionCard>
  );
}
