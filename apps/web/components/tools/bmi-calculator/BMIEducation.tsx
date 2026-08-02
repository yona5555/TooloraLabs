import { useTranslations } from "next-intl";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import BMICategoryTable from "./BMICategoryTable";
import BMIBodyLevelsChart from "./BMIBodyLevelsChart";
import BMICompositionChart from "./BMICompositionChart";

type CategoryRow = { category: string; range: string };
type ExampleStep = { label: string; value: string };
type University = { name: string; note: string; url: string; online: string };

export default function BMIEducation() {
  const t = useTranslations("tools.bmi-calculator.education");

  const categoryRows = t.raw("categoryTable.rows") as CategoryRow[];
  const overweightRisks = t.raw("risksOverweight.items") as string[];
  const underweightRisks = t.raw("risksUnderweight.items") as string[];
  const exampleSteps = t.raw("example.steps") as ExampleStep[];
  const primeSteps = t.raw("primeIndex.example.primeSteps") as ExampleStep[];
  const ponderalSteps = t.raw("primeIndex.example.ponderalSteps") as ExampleStep[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  const bodyLevels = [
    { bmi: 16, label: categoryRows[0].category },
    { bmi: 20, label: categoryRows[3].category },
    { bmi: 27, label: categoryRows[4].category },
    { bmi: 33, label: categoryRows[5].category },
    { bmi: 42, label: categoryRows[7].category },
  ];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
        <p className="rounded-sm border border-current/20 px-4 py-3 text-sm">
          {t("intro.disclaimer")}
        </p>
      </InfoSection>

      <InfoSection title={t("categoryTable.title")}>
        <p>{t("categoryTable.intro")}</p>
        <BMICategoryTable rows={categoryRows} />
      </InfoSection>

      <InfoSection title={t("bodyLevels.title")}>
        <p>{t("bodyLevels.intro")}</p>
        <BMIBodyLevelsChart levels={bodyLevels} />
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

      <InfoSection title={t("composition.title")}>
        <p>{t("composition.intro")}</p>
        <BMICompositionChart
          bmiLabel={t("composition.bmiLabel")}
          muscularLabel={t("composition.muscularLabel")}
          fatLabel={t("composition.fatLabel")}
        />
      </InfoSection>

      <InfoSection title={t("formula.title")}>
        <p>{t("formula.intro")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-current/20 p-4">
            <p className="text-sm opacity-70">{t("formula.metric.label")}</p>
            <p dir="ltr" className="mt-2 text-end font-semibold">
              {t("formula.metric.formula")}
            </p>
          </div>
          <div className="rounded-sm border border-current/20 p-4">
            <p className="text-sm opacity-70">{t("formula.us.label")}</p>
            <p dir="ltr" className="mt-2 text-end font-semibold">
              {t("formula.us.formula")}
            </p>
          </div>
        </div>
        <p className="text-sm opacity-70">{t("formula.note")}</p>

        <h3 className="pt-2 font-semibold">{t("example.title")}</h3>
        <p>{t("example.intro")}</p>
        <ol className="space-y-3">
          {exampleSteps.map((step, index) => (
            <li
              key={step.label}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-sm border border-current/20 px-4 py-3"
            >
              <span className="font-medium">
                {index + 1}. {step.label}
              </span>
              <span dir="ltr" className="text-sm opacity-80">
                {step.value}
              </span>
            </li>
          ))}
        </ol>
        <p className="font-medium">{t("example.result")}</p>
      </InfoSection>

      <InfoSection title={t("primeIndex.title")}>
        <p>{t("primeIndex.intro")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-current/20 p-4">
            <p className="text-sm opacity-70">{t("primeIndex.prime.label")}</p>
            <p dir="ltr" className="mt-2 text-end font-semibold">
              {t("primeIndex.prime.formula")}
            </p>
            <p className="mt-2 text-sm opacity-70">{t("primeIndex.prime.note")}</p>
          </div>
          <div className="rounded-sm border border-current/20 p-4">
            <p className="text-sm opacity-70">{t("primeIndex.ponderal.label")}</p>
            <p dir="ltr" className="mt-2 text-end font-semibold">
              {t("primeIndex.ponderal.formula")}
            </p>
            <p className="mt-2 text-sm opacity-70">{t("primeIndex.ponderal.note")}</p>
          </div>
        </div>

        <h3 className="pt-2 font-semibold">{t("primeIndex.example.title")}</h3>
        <p>{t("primeIndex.example.intro")}</p>
        <ol className="space-y-3">
          {[...primeSteps, ...ponderalSteps].map((step, index) => (
            <li
              key={step.label}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-sm border border-current/20 px-4 py-3"
            >
              <span className="font-medium">
                {index + 1}. {step.label}
              </span>
              <span dir="ltr" className="text-sm opacity-80">
                {step.value}
              </span>
            </li>
          ))}
        </ol>
        <p>{t("primeIndex.example.primeResult")}</p>
        <p>{t("primeIndex.example.ponderalResult")}</p>
      </InfoSection>

      <InfoSection title={t("limitations.title")}>
        <p>{t("limitations.paragraph1")}</p>
        <p>{t("limitations.paragraph2")}</p>
      </InfoSection>

      <InfoSection title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
      </InfoSection>

      <InfoSection title={t("behindTheTool.title")}>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.history.title")}</h3>
          <p className="mt-2">{t("behindTheTool.history.paragraph")}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.equipment.title")}</h3>
          <p className="mt-2">{t("behindTheTool.equipment.paragraph")}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.modernDevelopments.title")}</h3>
          <p className="mt-2">{t("behindTheTool.modernDevelopments.paragraph")}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.academicPath.title")}</h3>
          <p className="mt-2">{t("behindTheTool.academicPath.intro")}</p>
          <ul className="mt-4 space-y-4">
            {universities.map((uni) => (
              <li key={uni.name} className="rounded-sm border border-current/20 p-4">
                <p className="font-semibold">{uni.name}</p>
                <p className="mt-1 text-sm opacity-80">{uni.note}</p>
                <p className="mt-1 text-sm opacity-80">{uni.online}</p>
                <a
                  href={uni.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="mt-2 inline-block text-sm font-medium underline decoration-dotted underline-offset-4"
                >
                  {uni.url.replace(/^https?:\/\//, "")}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </InfoSection>

      <InfoSection title={t("references.title")}>
        <p>{t("references.citation")}</p>
        <p className="text-sm opacity-70">{t("references.note")}</p>
        <p dir="ltr" className="text-sm opacity-70">
          {t("references.doiLabel")}: {t("references.doi")}
        </p>
        <a
          href={t("references.url")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex rounded-sm border border-current/40 px-5 py-2.5 text-sm font-semibold no-underline transition hover:bg-current/5"
        >
          {t("references.readOriginal")}
        </a>
      </InfoSection>
    </EncyclopediaPaper>
  );
}
