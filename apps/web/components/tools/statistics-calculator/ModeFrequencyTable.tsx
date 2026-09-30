"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard, { type ReferenceTableRow } from "@/components/tool-ui/ReferenceTableCard";

const VALUES = [3, 7, 3, 9, 7, 3, 5, 7];

/** Type #17 (Tagged Reference Table): the real frequency of every distinct value in the data set, tagged by whether it's the mode — a bimodal-looking set at a glance, resolved by an actual frequency count. */
export default function ModeFrequencyTable() {
  const t = useTranslations("tools.statistics-calculator.education.modeFrequency");

  const frequency = new Map<number, number>();
  for (const v of VALUES) frequency.set(v, (frequency.get(v) ?? 0) + 1);
  const maxFreq = Math.max(...frequency.values());

  const rows: ReferenceTableRow[] = [...frequency.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([value, freq]) => ({
      key: `${value}`,
      label: `${value}`,
      value: `${freq}`,
      tag:
        freq === maxFreq
          ? { text: t("tagMode"), colorClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" }
          : { text: t("tagOther"), colorClass: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" },
    }));

  return <ReferenceTableCard title={t("title")} caption={t("intro", { values: VALUES.join(", ") })} columnLabel={t("columnValue")} columnValue={t("columnFrequency")} rows={rows} />;
}
