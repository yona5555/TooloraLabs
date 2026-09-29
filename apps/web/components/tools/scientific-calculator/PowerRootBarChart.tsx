"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const X = 4;

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #1 (Labeled Bar Chart): square, cube, square root, and cube root of the same value, side by side — the four keys in the calculator's power/root family compared on one number. */
export default function PowerRootBarChart() {
  const t = useTranslations("tools.scientific-calculator.education.functions.powerRoot");

  const square = X ** 2;
  const cube = X ** 3;
  const sqrt = round3(Math.sqrt(X));
  const cbrt = round3(Math.cbrt(X));

  const bars = [
    { label: t("square"), value: square, formatted: `${square}` },
    { label: t("cube"), value: cube, formatted: `${cube}`, highlight: true },
    { label: t("sqrt"), value: sqrt, formatted: `${sqrt}` },
    { label: t("cbrt"), value: cbrt, formatted: `${cbrt}` },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { x: X })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.square"), value: `${X}² = ${square}` },
            { label: t("worked.cube"), value: `${X}³ = ${cube}`, emphasize: true, note: t("worked.cubeNote") },
            { label: t("worked.sqrt"), value: `√${X} = ${sqrt}` },
            { label: t("worked.cbrt"), value: `∛${X} = ${cbrt}` },
          ]}
        />
      </div>
    </SectionCard>
  );
}
