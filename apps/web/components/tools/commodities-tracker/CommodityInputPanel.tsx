"use client";
import { useTranslations } from "next-intl";
import { AlertTriangle, RotateCcw } from "lucide-react";
import type { DigitStyle } from "@tooloralabs/core";
import { METAL_UNIT_GRAMS, OIL_UNIT_BARRELS, metalValueUsd, oilValueUsd, toBarrels, toTroyOunces } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import FiatPicker from "@/components/tools/markets/FiatPicker";
import QuickConversionTable, { quickAmounts } from "@/components/tools/markets/QuickConversionTable";
import { useMarketFormatters, type FiatRate } from "@/components/tools/markets/fiat";
import { COMMODITIES, isMetal, type CommodityId, type MetalUnit, type OilUnit } from "./types";

type Props = {
  commodity: CommodityId;
  onCommodityChange: (c: CommodityId) => void;
  amount: string;
  onAmountChange: (v: string) => void;
  metalUnit: MetalUnit;
  onMetalUnitChange: (u: MetalUnit) => void;
  oilUnit: OilUnit;
  onOilUnitChange: (u: OilUnit) => void;
  onClear: () => void;
  spot: number | null;
  dataUnavailable: boolean;
  fiatRates: FiatRate[];
  fiatCode: string;
  onFiatChange: (code: string) => void;
  digitStyle: DigitStyle;
};

const METAL_UNITS = Object.keys(METAL_UNIT_GRAMS) as MetalUnit[];
const OIL_UNITS = Object.keys(OIL_UNIT_BARRELS) as OilUnit[];
const QUICK = quickAmounts(-2, 9);

export default function CommodityInputPanel(p: Props) {
  const t = useTranslations("tools.commodities-tracker.aboveFold");
  const f = useMarketFormatters(p.digitStyle);
  const metal = isMetal(p.commodity);
  const units: string[] = metal ? METAL_UNITS : OIL_UNITS;
  const unit = metal ? p.metalUnit : p.oilUnit;
  const baseUnit = metal ? "oz t" : "bbl";

  return (
    <SectionCard title={t("converterTitle")} className="flex h-full flex-col" bodyClassName="flex flex-1 flex-col p-4 lg:p-6">
      <div className="space-y-5">
        {p.dataUnavailable && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>{t("dataUnavailable")}</p>
          </div>
        )}
        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("commodityLabel")}</span>
          <div className="grid grid-cols-2 gap-2">
            {COMMODITIES.map((id) => (
              <button
                key={id}
                type="button"
                data-commodity={id}
                aria-pressed={p.commodity === id}
                onClick={() => p.onCommodityChange(id)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  p.commodity === id
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {t(`commodity.${id}`)}
              </button>
            ))}
          </div>
        </div>

        <ToolInput
          label={t(metal ? "amountLabelWeight" : "amountLabelVolume")}
          type="text"
          inputMode="decimal"
          value={p.amount}
          onChange={(e) => p.onAmountChange(e.target.value)}
        />

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("unitLabel")}</span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("unitLabel")}>
            {units.map((u) => (
              <button
                key={u}
                type="button"
                data-unit={u}
                aria-pressed={unit === u}
                onClick={() => (metal ? p.onMetalUnitChange(u as MetalUnit) : p.onOilUnitChange(u as OilUnit))}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                  unit === u ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {t(`units.${u}`)}
              </button>
            ))}
          </div>
        </div>

        {p.fiatRates.length > 0 && (
          <FiatPicker
            rates={p.fiatRates}
            value={p.fiatCode}
            onChange={p.onFiatChange}
            label={t("fiatLabel")}
            searchPlaceholder={t("fiatSearchPlaceholder")}
            noResults={t("fiatNoResults")}
          />
        )}

        <button
          type="button"
          onClick={p.onClear}
          className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RotateCcw size={16} />
          {t("clear")}
        </button>
      </div>

      {p.spot !== null && (
        <QuickConversionTable
          title={t("quickTitle")}
          columns={[t(`unitsShort.${unit}`), baseUnit, f.currency]}
          rows={QUICK.map((a) => [
            f.num(a, 1),
            f.num(metal ? toTroyOunces(a, p.metalUnit) : toBarrels(a, p.oilUnit), 4),
            f.compactMoney(metal ? metalValueUsd(a, p.metalUnit, p.spot!) : oilValueUsd(a, p.oilUnit, p.spot!)),
          ])}
        />
      )}
    </SectionCard>
  );
}
