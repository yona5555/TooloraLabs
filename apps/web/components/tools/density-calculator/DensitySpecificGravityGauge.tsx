"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

const MIN_LOG = -3;
const MAX_LOG = 1.5;
const TICKS = [-3, -2, -1, 0, 1, 1.5];

// Ascending by density: air (lightest gas) up to osmium, the densest
// naturally occurring element — a wider, more varied spread than the
// original 6-material set, kept local to this widget so it doesn't ripple
// into the shared MATERIAL_KEYS list other components on the page rely on.
const GAUGE_MATERIALS: { key: string; density: number }[] = [
  { key: "air", density: 0.0012 },
  { key: "oak", density: 0.75 },
  { key: "ice", density: 0.92 },
  { key: "water", density: 1.0 },
  { key: "concrete", density: 2.4 },
  { key: "aluminum", density: 2.7 },
  { key: "iron", density: 7.87 },
  { key: "lead", density: 11.34 },
  { key: "mercury", density: 13.53 },
  { key: "gold", density: 19.3 },
  { key: "osmium", density: 22.59 },
];

function tickLabel(tick: number): string {
  const value = 10 ** tick;
  return value >= 1 ? String(Math.round(value)) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export default function DensitySpecificGravityGauge() {
  const t = useTranslations("tools.density-calculator.education.intro.sgGauge");
  const tIntro = useTranslations("tools.density-calculator.education.intro.buoyancy");
  const tGaugeMaterials = useTranslations("tools.density-calculator.education.intro.sgGauge.materials");
  const [selectedKey, setSelectedKey] = useState("iron");

  const selected = GAUGE_MATERIALS.find((m) => m.key === selectedKey) ?? GAUGE_MATERIALS[0];
  const density = selected.density;
  const verdict: "floats" | "sinks" | "neutral" = density < 1 ? "floats" : density > 1 ? "sinks" : "neutral";
  const digitStyle = resolveDigitStyle(String(density));
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 3 });

  const gaugeValue = Math.log10(Math.max(density, 10 ** MIN_LOG));
  const ratio = verdict === "floats" ? 1 / density : density;
  // 1 liter = 1000 cm3, and mass(g) = density x 1000, so mass in kg is
  // numerically identical to the density value itself in g/cm3.
  const literMassKg = density;

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
        {GAUGE_MATERIALS.map((m) => (
          <button
            key={m.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === m.key}
            onClick={() => setSelectedKey(m.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedKey === m.key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tGaugeMaterials(m.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">
        {verdict === "neutral"
          ? t("neutralVerdict", { material: tGaugeMaterials(selectedKey) })
          : t(verdict === "floats" ? "floatsVerdict" : "sinksVerdict", { material: tGaugeMaterials(selectedKey), ratio: fmt(ratio) })}
      </p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("literMass", { material: tGaugeMaterials(selectedKey), mass: fmt(literMassKg) })}</p>
    </EncyclopediaLiveWidget>
  );
}
