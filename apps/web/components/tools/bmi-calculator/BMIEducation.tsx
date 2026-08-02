import { useTranslations } from "next-intl";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import BMICategoryTable from "./BMICategoryTable";
import BMIScaleChart from "./BMIScaleChart";

type CategoryRow = { category: string; range: string };
type ExampleStep = { label: string; value: string };

export default function BMIEducation({ bmi }: { bmi?: number }) {
  const t = useTranslations("tools.bmi-calculator.education");

  const categoryRows = t.raw("categoryTable.rows") as CategoryRow[];
  const overweightRisks = t.raw("risksOverweight.items") as string[];
  const underweightRisks = t.raw("risksUnderweight.items") as string[];
  const exampleSteps = t.raw("example.steps") as ExampleStep[];
  const faqItems = t.raw("faq.items") as FAQItem[];

  return (
    <div className="mt-16 space-y-10">
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
        <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
          {t("intro.disclaimer")}
        </p>
      </InfoSection>

      <InfoSection title={t("categoryTable.title")}>
        <p>{t("categoryTable.intro")}</p>
        <BMICategoryTable rows={categoryRows} />
      </InfoSection>

      <InfoSection title={t("chart.title")}>
        <p>{t("chart.description")}</p>
        <BMIScaleChart
          bmi={bmi}
          labels={{
            underweight: t("chart.zones.underweight"),
            normal: t("chart.zones.normal"),
            overweight: t("chart.zones.overweight"),
            obese: t("chart.zones.obese"),
            yourBmi: t("chart.yourBmi"),
          }}
        />
      </InfoSection>

      <InfoSection title={t("risksOverweight.title")}>
        <p>{t("risksOverweight.intro")}</p>
        <ul className="list-disc space-y-2 ps-5">
          {overweightRisks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection title={t("risksUnderweight.title")}>
        <p>{t("risksUnderweight.intro")}</p>
        <ul className="list-disc space-y-2 ps-5">
          {underweightRisks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection title={t("limitations.title")}>
        <p>{t("limitations.paragraph1")}</p>
        <p>{t("limitations.paragraph2")}</p>
      </InfoSection>

      <InfoSection title={t("formula.title")}>
        <p>{t("formula.intro")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {t("formula.metric.label")}
            </p>
            <p dir="ltr" className="mt-2 text-end font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t("formula.metric.formula")}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {t("formula.us.label")}
            </p>
            <p dir="ltr" className="mt-2 text-end font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t("formula.us.formula")}
            </p>
          </div>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("formula.note")}</p>
      </InfoSection>

      <InfoSection title={t("example.title")}>
        <p>{t("example.intro")}</p>
        <ol className="space-y-3">
          {exampleSteps.map((step, index) => (
            <li
              key={step.label}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {index + 1}. {step.label}
              </span>
              <span dir="ltr" className="font-mono text-sm text-zinc-600 dark:text-zinc-300">
                {step.value}
              </span>
            </li>
          ))}
        </ol>
        <p className="font-medium text-zinc-900 dark:text-zinc-100">{t("example.result")}</p>
      </InfoSection>

      <InfoSection title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
      </InfoSection>
    </div>
  );
}
