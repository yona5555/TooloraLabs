"use client";
import { useTranslations } from "next-intl";
import { ScientificNotationConverter } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificNotationLive } from "./ScientificNotationLiveContext";

const tool = new ScientificNotationConverter();

/** Type #13 (Stepped Diagram): the reciprocal of the live standard-form value — always a genuine small positive number — converted to scientific notation with a real negative exponent. */
export default function SmallNumberConversionSteps() {
  const t = useTranslations("tools.scientific-notation-converter.education.smallNumberSteps");
  const { dims } = useScientificNotationLive();
  if (dims.standardValue === 0) return null;
  const smallValue = 1 / Math.abs(dims.standardValue);

  const output = tool.execute({ operation: "toScientific", standardValue: smallValue, coefficientA: 0, exponentA: 0, coefficientB: 0, exponentB: 0 }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { coefficient, exponent } = output.data.scientific;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: `${dims.standardValue.toLocaleString("en-US")}` })}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center font-mono text-lg">
        <span className="text-blue-700 dark:text-blue-300">{smallValue < 0.001 ? smallValue.toExponential(4) : smallValue.toFixed(6)}</span>
        <span className="text-zinc-400">→</span>
        <span className="font-bold text-emerald-700 dark:text-emerald-400">{`${coefficient} × 10^${exponent}`}</span>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.placesMoved"), value: `${Math.abs(exponent)}` },
            { label: t("worked.result"), value: `${coefficient} × 10^${exponent}`, emphasize: true, note: t("worked.negativeNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
