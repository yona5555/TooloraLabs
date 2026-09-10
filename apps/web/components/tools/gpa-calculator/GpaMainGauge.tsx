import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import { GPA_GAUGE_MAX, GPA_GAUGE_TICKS, GPA_GAUGE_ZONES, bandForGpa } from "./types";

type Props = {
  gpa: number;
  valueLabel: string;
};

const BAND_CAPTION_COLOR: Record<string, string> = {
  probation: "fill-red-600 dark:fill-red-400",
  satisfactory: "fill-amber-600 dark:fill-amber-400",
  good: "fill-blue-600 dark:fill-blue-400",
  excellent: "fill-emerald-600 dark:fill-emerald-400",
};

/** The 0-4.0 GPA scale, banded into standing zones actually used by the college-standing labels below the result. */
export default function GpaMainGauge({ gpa, valueLabel }: Props) {
  const t = useTranslations("tools.gpa-calculator.gauge");
  const band = bandForGpa(Math.max(0, gpa));

  return (
    <RatioGauge
      value={gpa}
      domainMin={0}
      domainMax={GPA_GAUGE_MAX}
      zones={GPA_GAUGE_ZONES}
      valueLabel={valueLabel}
      caption={t(band)}
      captionColorClass={BAND_CAPTION_COLOR[band]}
      ticks={GPA_GAUGE_TICKS}
    />
  );
}
