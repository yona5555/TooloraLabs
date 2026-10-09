"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import { percentFrom, type CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useCryptoFormatters, changeColor } from "./cryptoFormat";
import { ltrIsolate } from "@/lib/bidi";

type Props = { coin: CryptoCoin | undefined; digitStyle: DigitStyle };

export default function CryptoCoinTimeline({ coin, digitStyle }: Props) {
  const t = useTranslations("tools.crypto-converter.timeline");
  const locale = useLocale();
  const id = coin?.id;
  const [genesis, setGenesis] = useState<{ id: string; date: string | null } | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/crypto/details?id=${encodeURIComponent(id)}`)
      .then(async (r) => (r.ok ? ((await r.json()) as { genesisDate: string | null }).genesisDate : null))
      .then((date) => !cancelled && setGenesis({ id, date }))
      .catch(() => !cancelled && setGenesis({ id, date: null }));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const f = useCryptoFormatters(digitStyle);
  if (!coin) return null;
  const fmtDate = (iso: string) => new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(iso));
  const genesisDate = genesis?.id === coin.id ? genesis.date : undefined;
  const fromAth = coin.ath ? percentFrom(coin.ath, coin.currentPrice) : null;
  const fromAtl = coin.atl ? percentFrom(coin.atl, coin.currentPrice) : null;

  const stations = [
    { key: "genesis", date: genesisDate ?? null, price: null as number | null, pct: null as number | null, dot: "bg-zinc-500" },
    { key: "atl", date: coin.atlDate ?? null, price: coin.atl ?? null, pct: fromAtl, dot: "bg-red-500" },
    { key: "ath", date: coin.athDate ?? null, price: coin.ath ?? null, pct: fromAth, dot: "bg-emerald-500" },
    { key: "now", date: null, price: coin.currentPrice, pct: null, dot: "bg-blue-600" },
  ]
    // Chronological order; genesis (when recorded) always first, today always last.
    .sort((a, b) => (a.key === "now" ? 1 : b.key === "now" ? -1 : a.key === "genesis" ? -1 : b.key === "genesis" ? 1 : (a.date ?? "").localeCompare(b.date ?? "")));

  return (
    <SectionCard id="timeline" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading", { coin: coin.name })}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <ol className="relative min-w-0 flex-1 grid grid-cols-2 gap-y-4 sm:grid-cols-4" data-testid="coin-timeline">
          <span aria-hidden className="absolute inset-x-[12.5%] top-[7px] hidden h-0.5 bg-zinc-200 sm:block dark:bg-zinc-700" />
          {stations.map((s) => (
            <li key={s.key} className="relative flex flex-col items-center px-1 text-center">
              <span className={`z-10 h-4 w-4 rounded-full ring-4 ring-white dark:ring-zinc-900 ${s.dot}`} />
              <span className="mt-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100">{t(`stations.${s.key}`)}</span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {s.key === "now" ? t("today") : s.key === "genesis" && genesisDate === undefined ? "…" : s.date ? fmtDate(s.date) : t("notRecorded")}
              </span>
              {s.price !== null && (
                <span dir="ltr" className="mt-0.5 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {f.money(s.price)}
                </span>
              )}
              {s.pct !== null && (
                <span className={`font-mono text-[11px] font-semibold ${changeColor(-s.pct)}`}>
                  {t("nowVs", { pct: ltrIsolate(f.signedPct(s.pct, 1)) })}
                </span>
              )}
            </li>
          ))}
        </ol>
        <div className="lg:w-64">
          <WorkedExampleNote
            title={t("workedTitle")}
            rows={[
              { label: t("rowNow"), value: f.money(coin.currentPrice) },
              { label: t("stations.ath"), value: coin.ath ? f.money(coin.ath) : "—" },
              { label: t("rowFromAth"), value: fromAth !== null ? f.signedPct(fromAth, 1) : "—", note: t("rowFormula") },
              { label: t("stations.atl"), value: coin.atl ? f.money(coin.atl) : "—" },
              { label: t("rowFromAtl"), value: fromAtl !== null ? f.signedPct(fromAtl, 0) : "—", emphasize: true, note: t("rowFormula") },
            ]}
          />
        </div>
      </div>
    </SectionCard>
  );
}
