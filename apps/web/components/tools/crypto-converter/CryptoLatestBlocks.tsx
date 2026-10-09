"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { averageFeePerTx, blockFillPercent, blockRewardAtHeight } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import type { LiveBlock } from "@/lib/crypto/network";
import { useNetworkData } from "./useCryptoLive";
import LiveFallback from "./LiveFallback";

const SHOWN = 6;
const tail = (hash: string) => `…${hash.slice(-6)}`;

export default function CryptoLatestBlocks() {
  const t = useTranslations("tools.crypto-converter.liveBlocks");
  const locale = useLocale();
  const state = useNetworkData<LiveBlock[]>("blocks", 30_000);
  const [selected, setSelected] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const blocks = state.status === "ready" ? state.data.slice(0, SHOWN) : [];
  // Blocks newer than the previous poll's tip animate in; the first load doesn't animate.
  const tip = blocks[0]?.height ?? null;
  const [prevTip, setPrevTip] = useState<number | null>(null);
  const [fresh, setFresh] = useState<Set<number>>(() => new Set());
  if (tip !== null && tip !== prevTip) {
    setPrevTip(tip);
    setFresh(prevTip === null ? new Set() : new Set(blocks.filter((b) => b.height > prevTip).map((b) => b.height)));
  }

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  const num = (v: number, max = 0) => formatLocalizedNumber(v, "western", { maximumFractionDigits: max });
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const ago = (ts: number) => {
    const minutes = Math.max(0, Math.round((now / 1000 - ts) / 60));
    return minutes < 60 ? rtf.format(-minutes, "minute") : rtf.format(-Math.round(minutes / 60), "hour");
  };
  const detail = blocks.find((b) => b.height === selected) ?? blocks[0];

  return (
    <SectionCard id="latest-blocks" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading")}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      {state.status !== "ready" ? (
        <LiveFallback status={state.status} loading={t("loading")} error={t("error")} height={300} />
      ) : (
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <ol dir="ltr" className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3" data-testid="block-list">
              {blocks.map((b, i) => {
                const fill = blockFillPercent(b.weight);
                const isOpen = detail?.height === b.height;
                return (
                  <li key={b.height} className={`relative sm:[&:nth-child(3n)>span]:hidden ${fresh.has(b.height) ? "animate-block-in" : ""}`}>
                    <button
                      type="button"
                      onClick={() => setSelected(b.height)}
                      aria-expanded={isOpen}
                      className={`w-full rounded-xl border p-2.5 text-start transition ${
                        isOpen
                          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10"
                          : "border-zinc-200 bg-zinc-50 hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-800/50"
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">#{num(b.height)}</span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{ago(b.timestamp)}</span>
                      </div>
                      <div className="mt-1 font-mono text-[11px] leading-4 text-zinc-600 dark:text-zinc-300">
                        <div>
                          {num(b.txCount)} tx · {num(b.size / 1e6, 2)} MB
                        </div>
                        <div>~{num(b.medianFee, 1)} sat/vB</div>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700" title={`${num(fill, 1)}%`}>
                        <div className="h-full rounded-full bg-amber-500" style={{ width: `${fill}%` }} />
                      </div>
                      <div className="mt-1 truncate font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                        {t("prev")} {tail(b.previousHash)}
                      </div>
                    </button>
                    {/* Chain link: this block's prev-hash is the hash of the block listed after it. */}
                    {i < blocks.length - 1 && blocks[i + 1].hash === b.previousHash && (
                      <span
                        aria-hidden
                        className="absolute -end-5 top-1/2 hidden -translate-y-1/2 text-xs text-zinc-400 sm:block"
                      >
                        →
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{t("linkNote")}</p>
          </div>

          {detail && (
            <div className="lg:w-64" data-testid="block-detail">
              <WorkedExampleNote
                title={t("detailTitle", { height: num(detail.height) })}
                rows={[
                  { label: t("hash"), value: tail(detail.hash) },
                  {
                    label: t("prevHash"),
                    value: tail(detail.previousHash),
                    note: blocks.some((b) => b.hash === detail.previousHash) ? t("linked") : undefined,
                  },
                  { label: t("miner"), value: detail.pool || "—" },
                  { label: t("fill"), value: `${num(blockFillPercent(detail.weight), 1)}%`, note: t("fillNote") },
                  { label: t("totalFees"), value: `${num(detail.totalFees / 1e8, 4)} BTC` },
                  { label: t("avgFee"), value: `${num(averageFeePerTx(detail.totalFees, detail.txCount))} sat`, note: t("avgFeeNote") },
                  { label: t("subsidy"), value: `${num(blockRewardAtHeight(detail.height), 4)} BTC` },
                  { label: t("reward"), value: `${num(detail.reward / 1e8, 4)} BTC`, emphasize: true, note: t("rewardNote") },
                ]}
              />
            </div>
          )}
        </div>
      )}
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{t("source")}</p>
    </SectionCard>
  );
}
