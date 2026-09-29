"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const DEG = 90;

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/** Type #11 (Side-by-Side Equivalence): the same physical angle expressed in the calculator's two angle modes — degrees and radians — proving the Deg/Rad toggle changes only the unit, never the actual angle. */
export default function AngleModeEquivalence() {
  const t = useTranslations("tools.scientific-calculator.education.functions.angleMode");
  const rad = round4((DEG * Math.PI) / 180);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-4">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-4 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{`${DEG}°`}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("degMode")}</p>
        </div>
        <span className="text-2xl font-bold text-zinc-400 dark:text-zinc-500">=</span>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-4 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{`${rad} rad`}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("radMode")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.formula"), value: "rad = deg × π / 180" },
            { label: t("worked.result"), value: `${DEG} × π / 180 = ${rad}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
