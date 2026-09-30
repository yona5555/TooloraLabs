"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const A = { key: "bacterium", coefficient: 2, exponent: -6 };
const B = { key: "virus", coefficient: 1, exponent: -7 };

/** Type #16 (Side-by-Side Comparison Cards): two real microscopic sizes, same card structure, differing by one full order of magnitude — a bacterium is genuinely about ten times larger than a virus, not just "both very small." */
export default function MagnitudeComparisonCards() {
  const t = useTranslations("tools.scientific-notation-converter.education.magnitudeCompare");
  const ratio = (A.coefficient * Math.pow(10, A.exponent)) / (B.coefficient * Math.pow(10, B.exponent));

  const cards = [A, B];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.key} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t(`items.${c.key}`)}</p>
            <p className="mt-2 font-mono text-2xl font-bold text-blue-700 dark:text-blue-300">{`${c.coefficient}×10^${c.exponent}`}</p>
            <p className="mt-1 text-xs text-zinc-400">{t("unitLabel")}</p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.ratio"), value: `${Math.round(ratio)}×`, emphasize: true, note: t("worked.ratioNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
