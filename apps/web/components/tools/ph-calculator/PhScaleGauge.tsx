"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { COMMON_SUBSTANCES } from "./types";

const MIN_PH = 0;
const MAX_PH = 14;
const TICKS = [0, 7, 14];

export default function PhScaleGauge() {
  const t = useTranslations("tools.ph-calculator.education.intro.phScaleGauge");
  const tSubstances = useTranslations("tools.ph-calculator.substances");
  const [selectedKey, setSelectedKey] = useState("vinegar");

  const selected = COMMON_SUBSTANCES.find((s) => s.key === selectedKey) ?? COMMON_SUBSTANCES[0];
  const pH = selected.pH;
  const classification: "acidic" | "neutral" | "basic" = pH < 7 ? "acidic" : pH > 7 ? "basic" : "neutral";
  const digitStyle = resolveDigitStyle(String(pH));
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 });
  const fmtRatio = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  const ion = classification === "basic" ? "OH⁻" : "H⁺";
  const ratio = classification === "basic" ? 10 ** (pH - 7) : 10 ** (7 - pH);

  const classificationColor =
    classification === "acidic" ? "fill-red-600 dark:fill-red-400" : classification === "basic" ? "fill-blue-600 dark:fill-blue-400" : "fill-green-600 dark:fill-green-400";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={pH}
        domainMin={MIN_PH}
        domainMax={MAX_PH}
        zones={[
          { key: "acidic", from: MIN_PH, to: 7, colorClass: "stroke-red-500 dark:stroke-red-400" },
          { key: "basic", from: 7, to: MAX_PH, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
        ]}
        valueLabel={`pH ${fmt(pH)}`}
        caption={t(classification)}
        captionColorClass={classificationColor}
        ticks={TICKS}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {COMMON_SUBSTANCES.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === s.key}
            onClick={() => setSelectedKey(s.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedKey === s.key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tSubstances(s.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { substance: tSubstances(selectedKey), classification: t(classification) })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("ionFact", { ion, ratio: fmtRatio(ratio) })}</p>
    </EncyclopediaLiveWidget>
  );
}
