"use client";
import { useTranslations } from "next-intl";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import VectorIndicatorCard from "./VectorIndicatorCard";
import { useVectorAnalysis } from "./VectorLiveContext";

/** §31 #5 Ranked Horizontal Bar List: every length the calculator produces for the pair, sorted. */
export default function VectorMagnitudeRankedBars() {
  const t = useTranslations("tools.vector-calculator.indicators.magnitudeBars");
  const { r, f, n } = useVectorAnalysis();
  const items = [
    { label: "|A|", value: r.magA },
    { label: "|B|", value: r.magB },
    { label: "|A + B|", value: r.magSum },
    { label: "|A − B|", value: r.magDiff },
    { label: "|A × B|", value: r.crossMag },
    { label: "|projᴮA|", value: Math.abs(r.compAonB ?? 0) },
    { label: "|A ⊥ B|", value: r.rejMag ?? 0 },
  ].sort((a, b) => b.value - a.value);
  const bars = items.map((it, i) => ({ label: it.label, value: it.value, formatted: n(it.value, 3), highlight: i === 0 }));

  return (
    <VectorIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={<EduBarChart bars={bars} ariaLabel={t("title")} />}
      rows={[
        { label: t("largest"), value: `${items[0].label} = ${f(items[0].value)}` },
        { label: "|A + B|²", value: f(r.magSum ** 2) },
        { label: "|A − B|²", value: f(r.magDiff ** 2) },
        { label: t("lawLeft"), value: f(r.parallelogramLeft) },
        { label: t("lawRight"), value: f(r.parallelogramRight), emphasize: true },
      ]}
    />
  );
}
