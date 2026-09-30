"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useFractionLive } from "./FractionLiveContext";

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

/** Type #1 (Labeled Bar Chart): the live denominators of A and B compared against their real least common denominator — always at least as large as the bigger of the two. */
export default function FractionLCDBarChart() {
  const t = useTranslations("tools.fraction-calculator.education.lcdChart");
  const { dims } = useFractionLive();
  if (dims.denominatorA === 0 || dims.denominatorB === 0) return null;

  const divisor = gcd(dims.denominatorA, dims.denominatorB);
  const lcd = Math.abs((dims.denominatorA * dims.denominatorB) / divisor);
  const scaleA = lcd / Math.abs(dims.denominatorA);
  const scaleB = lcd / Math.abs(dims.denominatorB);
  const rescaledNumeratorA = dims.numeratorA * scaleA;
  const rescaledNumeratorB = dims.numeratorB * scaleB;

  const bars = [
    { label: t("denomALabel"), value: Math.abs(dims.denominatorA), formatted: `${Math.abs(dims.denominatorA)}` },
    { label: t("denomBLabel"), value: Math.abs(dims.denominatorB), formatted: `${Math.abs(dims.denominatorB)}` },
    { label: t("lcdLabel"), value: lcd, formatted: `${lcd}`, highlight: true },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.gcdOfDenoms"), value: `${divisor}` },
            { label: t("worked.lcd"), value: `${lcd}`, emphasize: true },
            { label: t("worked.rescaledA"), value: `${dims.numeratorA}/${dims.denominatorA} = ${rescaledNumeratorA}/${lcd}` },
            { label: t("worked.rescaledB"), value: `${dims.numeratorB}/${dims.denominatorB} = ${rescaledNumeratorB}/${lcd}` },
          ]}
        />
      </div>
    </SectionCard>
  );
}
