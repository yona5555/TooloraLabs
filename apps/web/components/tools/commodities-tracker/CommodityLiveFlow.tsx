"use client";
import { useLocale, useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import { METAL_UNIT_GRAMS, OIL_UNIT_BARRELS, toBarrels, toTroyOunces } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import CopyButton from "@/components/tool-ui/CopyButton";
import ShareExportModal from "@/components/tools/markets/ShareExportModal";
import Sparkline, { useRelativeUpdatedLabel } from "@/components/tools/markets/Sparkline";
import { changeColor, useMarketFormatters } from "@/components/tools/markets/fiat";
import { isMetal, type CommodityId, type MetalUnit, type OilUnit } from "./types";
import type { History, Loaded } from "./useCommodityData";

type Props = {
  commodity: CommodityId;
  amountText: string;
  amount: number;
  metalUnit: MetalUnit;
  oilUnit: OilUnit;
  spot: number | null;
  history: Loaded<History>;
  lastUpdatedUnix: number | null;
  digitStyle: DigitStyle;
};

/** The cash value inside an animated flow: quantity → (× spot price) → value, with copy/share and the math beside it. */
export default function CommodityLiveFlow({ commodity, amountText, amount, metalUnit, oilUnit, spot, history, lastUpdatedUnix, digitStyle }: Props) {
  const t = useTranslations("tools.commodities-tracker.liveFlow");
  const tAbove = useTranslations("tools.commodities-tracker.aboveFold");
  const locale = useLocale();
  const f = useMarketFormatters(digitStyle);
  const updatedLabel = useRelativeUpdatedLabel((lastUpdatedUnix ?? 0) * 1000, locale);
  if (spot === null) return null;

  const metal = isMetal(commodity);
  const amt = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const unit = metal ? metalUnit : oilUnit;
  const qty = metal ? toTroyOunces(amt, metalUnit) : toBarrels(amt, oilUnit);
  const usd = qty * spot;
  const base = metal ? "oz t" : "bbl";
  const unitLabel = tAbove(`unitsShort.${unit}`);
  const perUnitUsd = metal ? (spot * METAL_UNIT_GRAMS[metalUnit]) / METAL_UNIT_GRAMS.troyOunce : spot * OIL_UNIT_BARRELS[oilUnit];
  const name = tAbove(`commodity.${commodity}`);
  const window = history.status === "ready" ? history.data.points.slice(history.data.frequency === "monthly" ? -24 : -30) : null;
  const values = window ? window.map((p) => p.rate) : null;
  const change = values && values.length > 1 ? (values[values.length - 1] / values[0] - 1) * 100 : null;
  const resultText = f.money(usd);
  const updated = lastUpdatedUnix ? tAbove("lastUpdated", { time: updatedLabel }) : "";
  const sentence = `${amountText} ${unitLabel} ${name} = ${resultText}`;

  return (
    <SectionCard
      id="indicators"
      title={t("title")}
      action={
        <span className="flex items-center gap-1.5 text-xs font-semibold text-white" data-testid="live-badge">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
          {t("badge")}
        </span>
      }
    >
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading", { amount: amountText, unit: unitLabel, name })}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <div className="@container mt-4">
        <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-stretch">
          <div className="flex flex-col justify-between gap-4 @2xl:w-[26rem] @2xl:shrink-0">
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-500/30 dark:bg-blue-500/5">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{tAbove("resultTitle")}</p>
              <p className="break-all font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-50" data-testid="converted-amount">
                <span dir="ltr">{resultText}</span>
              </p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-blue-700 dark:text-blue-300" data-testid="converted-fiat">
                <span dir="ltr">
                  {f.num(qty, 4)} {base} × {f.money(spot)}
                </span>
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{updated}</span>
                <div className="flex items-center gap-2">
                  <CopyButton text={sentence} />
                  <ShareExportModal
                    namespace="tools.commodities-tracker"
                    operationLabel={name}
                    inputRows={[{ label: name, value: `${amountText} ${unitLabel}` }]}
                    resultRows={[
                      { label: tAbove("resultTitle"), value: resultText },
                      { label: `1 ${base}`, value: f.money(spot) },
                      { label: `1 ${unitLabel}`, value: f.money(perUnitUsd) },
                    ]}
                    heroLabel={name}
                    heroValue={resultText}
                    sentence={`${sentence} (${updated}).`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5">
              <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-800/50">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{name}</p>
                <div dir="ltr" className="mt-1 flex flex-wrap items-baseline justify-between gap-x-2">
                  <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100" data-testid="spot-price">
                    {f.money(spot)}
                  </span>
                  <span className={`font-mono text-xs font-semibold ${changeColor(change)}`}>{change === null ? "—" : f.signedPct(change)}</span>
                </div>
                <div dir="ltr" className="mt-1 flex items-end justify-between gap-1">
                  <Sparkline values={history.status === "loading" ? null : values} up={(change ?? 0) >= 0} width={96} />
                  <span className="text-[10px] text-zinc-400">{t(history.status === "ready" && history.data.frequency === "monthly" ? "spark24m" : "spark30d")}</span>
                </div>
                <p dir="ltr" className="mt-1 truncate text-end font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  / {base}
                </p>
              </div>
              <div className="flex flex-col items-center gap-1" aria-hidden>
                <div dir="ltr" className="rounded-full bg-blue-600 px-2 py-0.5 font-mono text-[10px] font-semibold text-white shadow-sm" data-testid="flow-rate">
                  × {f.num(qty, 4)}
                </div>
                <div className="flex items-center">
                  <div className="flow-shaft h-1 w-6 animate-flow-dash rounded" />
                  <div className="h-0 w-0 border-y-[7px] border-s-[9px] border-y-transparent border-s-blue-500" />
                </div>
              </div>
              <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-800/50">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("perYourUnit", { unit: unitLabel })}</p>
                <p dir="ltr" className="mt-1 font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {f.money(perUnitUsd)}
                </p>
                <p className="mt-2 text-[10px] text-zinc-400">{t("valueOf", { amount: amountText, unit: unitLabel })}</p>
                <p dir="ltr" className="truncate text-end font-mono text-sm font-semibold text-blue-700 dark:text-blue-300">
                  {resultText}
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <WorkedExampleNote
              title={t("workedTitle")}
              rows={[
                { label: t("rowAmount"), value: `${f.num(amt, 4)} ${unitLabel}` },
                {
                  label: t(metal ? "rowToOunces" : "rowToBarrels"),
                  value: metal
                    ? `× ${f.num(METAL_UNIT_GRAMS[metalUnit], 4)} ÷ 31.1035 = ${f.num(qty, 4)}`
                    : `× ${f.num(OIL_UNIT_BARRELS[oilUnit], 6)} = ${f.num(qty, 4)}`,
                },
                { label: t("rowSpot", { unit: base }), value: `× ${f.num(spot, 2)} USD` },
                { label: t("rowUsd"), value: `= ${f.num(usd, 2)} USD` },
                ...(f.currency !== "USD" ? [{ label: t("rowFx", { currency: f.currency }), value: `→ ${resultText}` }] : []),
                { label: t("rowResult"), value: resultText, emphasize: true, note: t("dailyNote") },
              ]}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
