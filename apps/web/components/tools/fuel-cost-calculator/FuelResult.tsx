import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CurrencyCode } from "@/lib/currency";
import FuelFlowDiagram from "./FuelFlowDiagram";
import FuelPriceSensitivityDiagram from "./FuelPriceSensitivityDiagram";
import FuelShareExportModal from "./FuelShareExportModal";
import FuelWorkedExampleNote from "./FuelWorkedExampleNote";
import type { FuelCostCalculatorOutput } from "./types";

type Props = {
  result: FuelCostCalculatorOutput;
  distance: number;
  pricePerUnit: number;
  digitStyle: DigitStyle;
  currency: CurrencyCode;
};

export default function FuelResult({ result, distance, pricePerUnit, digitStyle, currency }: Props) {
  const t = useTranslations("tools.fuel-cost-calculator.result");
  const ts = useTranslations("tools.fuel-cost-calculator.sensitivityDiagram");
  const tform = useTranslations("tools.fuel-cost-calculator.form");
  const tw = useTranslations("tools.fuel-cost-calculator.workedExample");
  const fmt = (value: number, maxFractionDigits = 2) =>
    formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: maxFractionDigits });
  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits: 2 });

  if (result.error) {
    const messageKey =
      result.error === "invalid-distance"
        ? "invalidDistance"
        : result.error === "invalid-rate"
          ? "invalidRate"
          : "invalidPrice";
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
        </div>
      </div>
    );
  }

  const sentence = t("sentence", { distance: fmt(distance, 0), cost: money(result.totalCost) });

  const fuelUsed = result.fuelUsed;
  const sensitivityPoints = [0.6, 0.8, 1, 1.2, 1.4, 1.6].map((multiplier) => {
    const price = pricePerUnit * multiplier;
    return { price, cost: fuelUsed * price };
  });

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <FuelShareExportModal
          inputRows={[{ label: t("fuelUsedLabel"), value: fmt(result.fuelUsed) }]}
          resultRows={[{ label: t("costPerDistanceLabel"), value: money(result.costPerDistanceUnit) }]}
          heroLabel={t("heading")}
          heroValue={money(result.totalCost)}
          sentence={sentence}
        />
      </div>
      <div className="p-4 lg:p-6">
        <p className="text-center font-mono text-3xl font-bold text-blue-700 dark:text-blue-300">
          {money(result.totalCost)}
        </p>

        {/* Stacked (not side-by-side) deliberately: this is the narrower above-the-fold
            result column, not a wide education card — at lg: viewport width the redesigned
            full-width flow boxes and the table would compete for the same ~450px and both
            get crushed (confirmed visually before this fix). Stacking keeps both legible. */}
        <div className="mt-5 flex flex-col gap-4">
          <FuelFlowDiagram
            distanceLabel={fmt(distance, 0)}
            fuelLabel={fmt(result.fuelUsed)}
            costLabel={money(result.totalCost)}
          />
          <FuelWorkedExampleNote
            title={tw("title")}
            rows={[
              { label: t("fuelUsedLabel"), value: fmt(result.fuelUsed) },
              { label: tform("priceLabel"), value: money(pricePerUnit) },
              { label: t("heading"), value: money(result.totalCost), emphasize: true },
              { label: t("costPerDistanceLabel"), value: money(result.costPerDistanceUnit) },
            ]}
          />
        </div>

        {pricePerUnit > 0 && (
          <div className="mt-5 flex flex-col gap-4 border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <FuelPriceSensitivityDiagram
              points={sensitivityPoints}
              currentPrice={pricePerUnit}
              caption={ts("caption")}
              xLabel={ts("xLabel")}
              currency={currency}
              digitStyle={digitStyle}
            />
            <FuelWorkedExampleNote
              title={tw("title")}
              rows={[
                { label: tform("priceLabel"), value: money(pricePerUnit) },
                { label: t("heading"), value: money(sensitivityPoints[2].cost), emphasize: true },
                { label: ts("lowScenarioLabel"), value: money(sensitivityPoints[0].cost) },
                { label: ts("highScenarioLabel"), value: money(sensitivityPoints[5].cost) },
              ]}
            />
          </div>
        )}

        <ul className="mt-5 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("fuelUsedLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.fuelUsed)}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("costPerDistanceLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
              {money(result.costPerDistanceUnit)}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
