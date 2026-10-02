"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificAngle } from "./ScientificAngleContext";

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #11 (Side-by-Side Equivalence): the hero's own current angle, shown simultaneously in the three units a scientific calculator's angle-mode setting actually switches between. */
export default function AngleModeEquivalence() {
  const t = useTranslations("tools.scientific-calculator.education.angleMode");
  const { dims } = useScientificAngle();

  const radians = round3((dims.angleDeg * Math.PI) / 180);
  const gradians = round3(dims.angleDeg * (10 / 9));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="grid shrink-0 grid-cols-3 gap-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">{t("degreesLabel")}</p>
            <p className="mt-2 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${round3(dims.angleDeg)}°`}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{t("radiansLabel")}</p>
            <p className="mt-2 font-mono text-lg font-bold text-zinc-700 dark:text-zinc-200">{`${radians} rad`}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{t("gradiansLabel")}</p>
            <p className="mt-2 font-mono text-lg font-bold text-zinc-700 dark:text-zinc-200">{`${gradians} grad`}</p>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.degToRad"), value: "rad = deg × π / 180" },
            { label: t("worked.degToGrad"), value: "grad = deg × 10 / 9", emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
