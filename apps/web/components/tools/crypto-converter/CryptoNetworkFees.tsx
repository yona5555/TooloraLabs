"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { TYPICAL_TX_VBYTES, transactionFee } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import type { FeeSnapshot } from "@/lib/crypto/network";
import { useNetworkData } from "./useCryptoLive";
import LiveFallback from "./LiveFallback";

type CryptoNetworkFeesProps = { btcPriceUsd: number | null; digitStyle: DigitStyle };

const LEVELS = [
  { key: "low", pick: (f: FeeSnapshot) => f.hour, dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  { key: "medium", pick: (f: FeeSnapshot) => f.halfHour, dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  { key: "high", pick: (f: FeeSnapshot) => f.fastest, dot: "bg-red-500", text: "text-red-700 dark:text-red-400" },
] as const;

export default function CryptoNetworkFees({ btcPriceUsd, digitStyle }: CryptoNetworkFeesProps) {
  const t = useTranslations("tools.crypto-converter.fees");
  const state = useNetworkData<FeeSnapshot>("fees", 30_000);
  const price = btcPriceUsd ?? 0;

  const num = (v: number, max = 1) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max });
  const usd = (v: number) =>
    formatLocalizedNumber(v, digitStyle, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: v < 0.1 ? 3 : 2 });

  if (state.status !== "ready") {
    return (
      <SectionCard id="network-fees" title={t("title")}>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading")}</h3>
        <LiveFallback status={state.status} loading={t("loading")} error={t("error")} height={220} />
      </SectionCard>
    );
  }

  const fees = state.data;
  // Percentiles of the next projected block: [min, p10, p25, p50, p75, p90, max]; the max is
  // often a single extreme outlier, so the axis is scaled to p90 / the fastest rate instead.
  const r = fees.nextBlockRange.length === 7 ? fees.nextBlockRange : null;
  const axisMax = Math.max(fees.fastest, r ? r[5] : 0, 1) * 1.25;
  const pos = (v: number) => `${Math.min(100, (v / axisMax) * 100)}%`;
  const levels = LEVELS.map((l) => ({ ...l, rate: l.pick(fees), fee: transactionFee(l.pick(fees), TYPICAL_TX_VBYTES, price) }));

  return (
    <SectionCard id="network-fees" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading")}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { vbytes: TYPICAL_TX_VBYTES })}</p>

      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1" dir="ltr">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("distributionLabel")}</p>
          <div className="relative mt-1.5 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800">
            {r && (
              <>
                <div className="absolute inset-y-1 rounded bg-blue-200 dark:bg-blue-900/60" style={{ left: pos(r[1]), width: `calc(${pos(r[5])} - ${pos(r[1])})` }} />
                <div className="absolute inset-y-0 rounded bg-blue-400 dark:bg-blue-600" style={{ left: pos(r[2]), width: `calc(${pos(r[4])} - ${pos(r[2])})` }} />
                <div className="absolute inset-y-0 w-0.5 bg-blue-900 dark:bg-blue-200" style={{ left: pos(r[3]) }} title={t("median")} />
              </>
            )}
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-400">
            <span>0</span>
            {r && <span>{t("medianShort", { rate: num(r[3]) })}</span>}
            <span>{num(axisMax)} sat/vB</span>
          </div>

          <ul className="mt-4 space-y-3" data-testid="fee-levels">
            {levels.map((l) => (
              <li key={l.key}>
                <div className="flex items-baseline justify-between text-xs">
                  <span className={`font-semibold ${l.text}`}>{t(`levels.${l.key}`)}</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-200">
                    {num(l.rate)} sat/vB · {price ? usd(l.fee.usd) : "—"}
                  </span>
                </div>
                <div className="relative mt-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <span className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white dark:ring-zinc-900 ${l.dot}`} style={{ left: pos(l.rate) }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:w-64">
          <WorkedExampleNote
            title={t("workedTitle")}
            rows={[
              { label: t("rowRate"), value: `${num(levels[1].rate)} sat/vB` },
              { label: t("rowSize"), value: `× ${TYPICAL_TX_VBYTES} vB` },
              { label: t("rowSats"), value: `= ${num(levels[1].fee.sats, 0)} sat` },
              { label: t("rowBtc"), value: `${num(levels[1].fee.btc * 1e3, 5)} mBTC` },
              { label: t("rowPrice"), value: price ? usd(price) : "—" },
              { label: t("rowUsd"), value: price ? usd(levels[1].fee.usd) : "—", emphasize: true, note: t("rowUsdNote") },
            ]}
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{t("source")}</p>
    </SectionCard>
  );
}
