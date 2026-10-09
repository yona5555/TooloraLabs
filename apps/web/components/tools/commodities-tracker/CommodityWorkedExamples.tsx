import { getTranslations } from "next-intl/server";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { METAL_UNIT_GRAMS, TROY_OUNCE_IN_GRAMS, karatPurity, toBarrels } from "@tooloralabs/tools";
import InfoSection from "@/components/tool-ui/InfoSection";

type Props = { gold: number | null; silver: number | null; brent: number | null; lastUpdatedUnix: number | null; locale: string };

/** Three valuations worked step by step from the same spot prices the tracker loaded. */
export default async function CommodityWorkedExamples({ gold, silver, brent, lastUpdatedUnix, locale }: Props) {
  const t = await getTranslations("tools.commodities-tracker.workedExamples");
  const n = (v: number, max = 4) => formatLocalizedNumber(v, "western", { maximumFractionDigits: max });
  const usd = (v: number) => formatLocalizedNumber(v, "western", { style: "currency", currency: "USD" });
  const when = lastUpdatedUnix ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(lastUpdatedUnix * 1000) : "";

  const examples = [
    gold !== null && {
      title: t("ex1Title"),
      steps: [
        [t("ex1Step1"), `20 g ÷ ${n(TROY_OUNCE_IN_GRAMS)} = ${n(20 / TROY_OUNCE_IN_GRAMS)} oz t`],
        [t("ex1Step2"), `${n(20 / TROY_OUNCE_IN_GRAMS)} × ${usd(gold)} = ${usd((20 / TROY_OUNCE_IN_GRAMS) * gold)}`],
        [t("ex1Step3"), `× 21 ÷ 24 = × ${n(karatPurity(21))}`],
      ],
      result: `20 g 21K = ${usd((20 / TROY_OUNCE_IN_GRAMS) * gold * karatPurity(21))}`,
    },
    silver !== null && {
      title: t("ex2Title"),
      steps: [
        [t("ex2Step1"), `1,000 g ÷ ${n(TROY_OUNCE_IN_GRAMS)} = ${n(METAL_UNIT_GRAMS.kilogram / TROY_OUNCE_IN_GRAMS)} oz t`],
        [t("ex2Step2"), `${n(METAL_UNIT_GRAMS.kilogram / TROY_OUNCE_IN_GRAMS)} × ${usd(silver)} = ${usd((1000 / TROY_OUNCE_IN_GRAMS) * silver)}`],
        [t("ex2Step3"), `× 0.925 = ${usd((1000 / TROY_OUNCE_IN_GRAMS) * silver * 0.925)}`],
      ],
      result: `1 kg 925 = ${usd((1000 / TROY_OUNCE_IN_GRAMS) * silver * 0.925)}`,
    },
    brent !== null && {
      title: t("ex3Title"),
      steps: [
        [t("ex3Step1"), `10,000 L ÷ 158.987 = ${n(toBarrels(10000, "liter"), 2)} bbl`],
        [t("ex3Step2"), `${n(toBarrels(10000, "liter"), 2)} × ${usd(brent)} = ${usd(toBarrels(10000, "liter") * brent)}`],
        [t("ex3Step3"), `${usd(brent)} ÷ 158.987 = ${usd(brent / 158.987294928)} / L`],
      ],
      result: `10,000 L Brent = ${usd(toBarrels(10000, "liter") * brent)}`,
    },
  ].filter((e): e is { title: string; steps: string[][]; result: string } => Boolean(e));
  if (examples.length === 0) return null;

  return (
    <InfoSection id="worked-examples" title={t("title")}>
      <p>{t("intro", { time: `${when} UTC` })}</p>
      <div className="grid gap-4 md:grid-cols-3">
        {examples.map((e, i) => (
          <div key={i} className="rounded-xl border border-current/15 p-4 text-sm leading-6">
            <p className="font-semibold">
              {t("exampleTitle", { n: i + 1 })}: {e.title}
            </p>
            <ol className="mt-2 list-decimal space-y-1.5 ps-5">
              {e.steps.map(([label, math], j) => (
                <li key={j}>
                  {label}{" "}
                  <span dir="ltr" className="font-mono">
                    {math}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 font-mono font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" dir="ltr">
              {e.result}
            </p>
          </div>
        ))}
      </div>
    </InfoSection>
  );
}
