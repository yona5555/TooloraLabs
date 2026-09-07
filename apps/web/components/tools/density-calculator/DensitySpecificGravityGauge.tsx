"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { MATERIAL_KEYS, MATERIAL_DENSITIES, type MaterialKey } from "./types";

const MIN_LOG = -3;
const MAX_LOG = 1.5;
const TICKS = [-3, -2, -1, 0, 1, 1.5];

function tickLabel(tick: number): string {
  const value = 10 ** tick;
  return value >= 1 ? String(Math.round(value)) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export default function DensitySpecificGravityGauge() {
  const t = useTranslations("tools.density-calculator.education.intro.sgGauge");
  const tIntro = useTranslations("tools.density-calculator.education.intro.buoyancy");
  const tMaterials = useTranslations("tools.density-calculator.materials");
  const [selected, setSelected] = useState<MaterialKey>("iron");

  const density = MATERIAL_DENSITIES[selected];
  const verdict: "floats" | "sinks" | "neutral" = density < 1 ? "floats" : density > 1 ? "sinks" : "neutral";
  const digitStyle = resolveDigitStyle(String(density));
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 3 });

  const gaugeValue = Math.log10(Math.max(density, 10 ** MIN_LOG));
  const ratio = verdict === "floats" ? 1 / density : density;

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={gaugeValue}
        domainMin={MIN_LOG}
        domainMax={MAX_LOG}
        zones={[
          { key: "floats", from: MIN_LOG, to: 0, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "sinks", from: 0, to: MAX_LOG, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
        ]}
        valueLabel={`SG ${fmt(density)}`}
        caption={verdict === "floats" ? tIntro("floats") : verdict === "sinks" ? tIntro("sinks") : t("neutralCaption")}
        captionColorClass={
          verdict === "floats" ? "fill-blue-600 dark:fill-blue-400" : verdict === "sinks" ? "fill-amber-600 dark:fill-amber-400" : "fill-zinc-500 dark:fill-zinc-400"
        }
        ticks={TICKS}
        tickFormatter={tickLabel}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {MATERIAL_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={selected === key}
            onClick={() => setSelected(key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selected === key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tMaterials(key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">
        {verdict === "neutral"
          ? t("neutralVerdict", { material: tMaterials(selected) })
          : t(verdict === "floats" ? "floatsVerdict" : "sinksVerdict", { material: tMaterials(selected), ratio: fmt(ratio) })}
      </p>
    </EncyclopediaLiveWidget>
  );
}
