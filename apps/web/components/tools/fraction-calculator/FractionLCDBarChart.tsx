"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const D_A = 4;
const D_B = 6;

function gcd(a: number, b: number): number {
  let x = a;
  let y = b;
  while (y) [x, y] = [y, x % y];
  return x || 1;
}
function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

/** Type #1 (Labeled Bar Chart): the two original denominators next to their least common denominator — visibly the smallest of the three is never large enough on its own, and the LCD is never larger than the product of both. */
export default function FractionLCDBarChart() {
  const t = useTranslations("tools.fraction-calculator.education.lcd");
  const commonDenominator = lcm(D_A, D_B);
  const product = D_A * D_B;

  const bars = [
    { label: t("denA"), value: D_A, formatted: `${D_A}` },
    { label: t("denB"), value: D_B, formatted: `${D_B}` },
    { label: t("lcdLabel"), value: commonDenominator, formatted: `${commonDenominator}`, highlight: true },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { a: D_A, b: D_B })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.product"), value: `${D_A} × ${D_B} = ${product}` },
            { label: t("worked.gcd"), value: `gcd(${D_A}, ${D_B}) = ${gcd(D_A, D_B)}` },
            { label: t("worked.lcd"), value: `${product} / ${gcd(D_A, D_B)} = ${commonDenominator}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
