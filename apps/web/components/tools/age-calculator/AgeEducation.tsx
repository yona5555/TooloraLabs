import { useTranslations } from "next-intl";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AgeGenerationTable from "./AgeGenerationTable";
import AgeLifeChart from "./AgeLifeChart";

type GenerationRow = { generation: string; range: string };
type ExampleStep = { label: string; value: string };
type University = { name: string; note: string; url: string; online: string };

export default function AgeEducation() {
  const t = useTranslations("tools.age-calculator.education");

  const generationRows = t.raw("generationTable.rows") as GenerationRow[];
  const exampleSteps = t.raw("calculationMethod.example.steps") as ExampleStep[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
        <p className="rounded-sm border border-current/20 px-4 py-3 text-sm">{t("intro.disclaimer")}</p>
      </InfoSection>

      <InfoSection title={t("calculationMethod.title")}>
        <p>{t("calculationMethod.intro")}</p>
        <p>{t("calculationMethod.borrowingExplanation")}</p>

        <h3 className="pt-2 font-semibold">{t("calculationMethod.example.title")}</h3>
        <p>{t("calculationMethod.example.intro")}</p>
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
        <p className="font-medium">{t("calculationMethod.example.result")}</p>
      </InfoSection>

      <InfoSection title={t("culturalReckoning.title")}>
        <p>{t("culturalReckoning.intro")}</p>
        <div>
          <h3 className="font-semibold">{t("culturalReckoning.hijri.title")}</h3>
          <p className="mt-2">{t("culturalReckoning.hijri.paragraph")}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t("culturalReckoning.korea.title")}</h3>
          <p className="mt-2">{t("culturalReckoning.korea.paragraph")}</p>
        </div>
      </InfoSection>

      <InfoSection title={t("generationTable.title")}>
        <p>{t("generationTable.intro")}</p>
        <AgeGenerationTable rows={generationRows} />
      </InfoSection>

      <InfoSection title={t("lifeChart.title")}>
        <p>{t("lifeChart.intro")}</p>
        <AgeLifeChart
          label={t("lifeChart.title")}
          livedLabel={t("lifeChart.livedLabel")}
          remainingLabel={t("lifeChart.remainingLabel")}
        />
      </InfoSection>

      <InfoSection title={t("milestonesContext.title")}>
        <p>{t("milestonesContext.paragraph")}</p>
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
