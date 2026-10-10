"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import CircleLive3D from "./CircleLive3D";
import CircleShareExportModal from "./CircleShareExportModal";
import { useCircleRadius } from "./CircleLiveContext";

/**
 * Result card: the area as the hero value, then the deep live table + rotating 3D disk.
 * While the field holds an invalid value the card keeps the last valid circle and says so.
 */
export default function CircleResult({ invalid }: { invalid: boolean }) {
  const t = useTranslations("tools.circle-calculator.result");
  const tForm = useTranslations("tools.circle-calculator.form");
  const { r, knownField, fmt } = useCircleRadius();
  const { f } = fmt;

  const values = { radius: r, diameter: 2 * r, circumference: 2 * Math.PI * r, area: Math.PI * r * r };
  const resultRows = (Object.keys(values) as Array<keyof typeof values>).map((k) => ({ label: t(`fields.${k}`), value: f(values[k]) }));
  const sentence = t("sentence", { field: t(`fields.${knownField}`), value: f(values[knownField]) });

  return (
    <SectionCard
      title={t("heading")}
      action={
        <CircleShareExportModal
          inputRows={[{ label: tForm("knownFieldLabel"), value: t(`fields.${knownField}`) }]}
          resultRows={resultRows}
          heroLabel={t("fields.area")}
          heroValue={f(values.area)}
          sentence={sentence}
        />
      }
    >
      {invalid && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">{t("invalidValue")}</p>}
      <div className="text-center">
        <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">{t("fields.area")}</p>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{f(values.area)}</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{sentence}</p>
      </div>
      <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <CircleLive3D r={r} knownField={knownField} fmt={fmt} />
      </div>
    </SectionCard>
  );
}
