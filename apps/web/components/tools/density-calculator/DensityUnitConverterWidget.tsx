"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, parseLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolInput from "@/components/tool-ui/ToolInput";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { MATERIAL_KEYS, MATERIAL_DENSITIES } from "./types";

const MIN_LOG = -3;
const MAX_LOG = 1.5;
const WATER_PERCENT = ((0 - MIN_LOG) / (MAX_LOG - MIN_LOG)) * 100;

function nearestMaterial(density: number) {
  return MATERIAL_KEYS.reduce((closest, key) => {
    const diff = Math.abs(Math.log10(MATERIAL_DENSITIES[key]) - Math.log10(density || 10 ** MIN_LOG));
    const closestDiff = Math.abs(Math.log10(MATERIAL_DENSITIES[closest]) - Math.log10(density || 10 ** MIN_LOG));
    return diff < closestDiff ? key : closest;
  }, MATERIAL_KEYS[0]);
}

export default function DensityUnitConverterWidget() {
  const t = useTranslations("tools.density-calculator.education.behindTheTool.unitsSection.liveConverter");
  const tMaterials = useTranslations("tools.density-calculator.materials");
  const [raw, setRaw] = useState("7.87");

  const density = Math.max(0, parseLocalizedNumber(raw) || 0);
  const digitStyle = resolveDigitStyle(raw);
  const fmt = (value: number, maximumFractionDigits = 3) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits });

  const densitySI = density * 1000;
  const specificGravity = density;
  const literMassKg = density;
  const closestKey = nearestMaterial(density);
  const fillPercent = density > 0 ? Math.min(100, Math.max(0, ((Math.log10(density) - MIN_LOG) / (MAX_LOG - MIN_LOG)) * 100)) : 0;

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div className="mx-auto max-w-xs">
        <ToolInput label={t("inputLabel")} type="text" inputMode="decimal" value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="7.87" />
      </div>

      <div dir="ltr" className="mx-auto mt-5 max-w-md">
        <div className="relative h-3 w-full rounded-full bg-current/10">
          <div className="h-full rounded-full bg-blue-500 transition-all duration-200 dark:bg-blue-400" style={{ width: `${fillPercent}%` }} />
          <div className="absolute top-0 h-3 w-0.5 bg-current/50" style={{ left: `${WATER_PERCENT}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] opacity-60">
          <span>{t("scaleLow")}</span>
          <span>{t("waterMarker")}</span>
          <span>{t("scaleHigh")}</span>
        </div>
      </div>

      <dl dir="ltr" className="mx-auto mt-5 grid max-w-md grid-cols-3 gap-3 text-center text-sm">
        <div>
          <dt className="text-xs opacity-60">g/cm³</dt>
          <dd className="font-mono font-semibold">{fmt(density)}</dd>
        </div>
        <div>
          <dt className="text-xs opacity-60">kg/m³</dt>
          <dd className="font-mono font-semibold">{fmt(densitySI, 1)}</dd>
        </div>
        <div>
          <dt className="text-xs opacity-60">SG</dt>
          <dd className="font-mono font-semibold">{fmt(specificGravity)}</dd>
        </div>
      </dl>

      <div className="mt-5 space-y-1.5 border-t border-current/10 pt-4 text-center text-sm leading-6">
        <p>{t("literMass", { mass: fmt(literMassKg) })}</p>
        <p className="opacity-80">{t("nearestMaterial", { material: tMaterials(closestKey), materialDensity: fmt(MATERIAL_DENSITIES[closestKey]) })}</p>
      </div>
    </EncyclopediaLiveWidget>
  );
}
