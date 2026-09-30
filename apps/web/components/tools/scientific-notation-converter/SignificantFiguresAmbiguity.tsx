"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

/** Type #11 (Side-by-Side Equivalence), applied to a genuine ambiguity: "1,200" alone could mean 2, 3, or 4 significant figures depending on measurement precision — scientific notation removes the guesswork entirely by only writing the digits that were actually measured. */
export default function SignificantFiguresAmbiguity() {
  const t = useTranslations("tools.scientific-notation-converter.education.sigFigs");

  const readings = [
    { sci: "1.2×10³", sigFigs: 2 },
    { sci: "1.20×10³", sigFigs: 3 },
    { sci: "1.200×10³", sigFigs: 4 },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {readings.map((r) => (
          <div key={r.sci} className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
            <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{r.sci}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("sigFigsLabel", { count: r.sigFigs })}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("standardAmbiguous")}</p>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: "1,200", value: t("worked.ambiguous") },
            { label: "1.200×10³", value: t("worked.unambiguous"), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
