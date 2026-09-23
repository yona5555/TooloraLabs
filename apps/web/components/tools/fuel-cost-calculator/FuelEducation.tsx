import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import FuelEfficiencyGauge from "./FuelEfficiencyGauge";
import FuelCostComparisonDiagram from "./FuelCostComparisonDiagram";
import FuelFormulaDiagram from "./FuelFormulaDiagram";
import FuelDistanceScaleChart from "./FuelDistanceScaleChart";
import FuelPriceBandChart from "./FuelPriceBandChart";
import FuelEfficiencyComparisonChart from "./FuelEfficiencyComparisonChart";
import FuelAnnualProjectionChart from "./FuelAnnualProjectionChart";
import FuelTypeCostComparisonChart from "./FuelTypeCostComparisonChart";
import FuelUnitConversionDiagram from "./FuelUnitConversionDiagram";
import FuelCostPerMileVsKmChart from "./FuelCostPerMileVsKmChart";
import FuelExamplesTable from "./FuelExamplesTable";

type ExampleRow = { scenario: string; result: string };
type UseCaseItem = { title: string; description: string };

export default async function FuelEducation() {
  const t = await getTranslations("tools.fuel-cost-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const useCaseItems = t.raw("useCases.items") as UseCaseItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <FuelEfficiencyGauge />

      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
        <FuelFormulaDiagram />
        <FuelCostComparisonDiagram />
      </InfoSection>

      <InfoSection title={t("useCases.title")}>
        <p>{t("useCases.intro")}</p>
        <div className="space-y-4">
          {useCaseItems.map((item) => (
            <div key={item.title}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1">{item.description}</p>
            </div>
          ))}
        </div>
        <FuelDistanceScaleChart />
        <FuelAnnualProjectionChart />
      </InfoSection>

      <InfoSection title={t("examples.title")}>
        <p>{t("examples.intro")}</p>
        <FuelExamplesTable rows={exampleRows} columnScenario={t("examples.columnScenario")} columnResult={t("examples.columnResult")} />
        <FuelPriceBandChart />
        <FuelEfficiencyComparisonChart />
        <FuelTypeCostComparisonChart />
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection id="faq" title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
      </InfoSection>

      <InfoSection id="behind-the-tool" title={t("behindTheTool.title")}>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.history.title")}</h3>
          <p className="mt-2">{t("behindTheTool.history.paragraph")}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.modernDevelopments.title")}</h3>
          <p className="mt-2">{t("behindTheTool.modernDevelopments.paragraph")}</p>
        </div>
        <AcademicPathSection
          title={t("behindTheTool.academicPath.title")}
          intro={t("behindTheTool.academicPath.intro")}
          universities={universities}
        />
        <FuelUnitConversionDiagram />
        <FuelCostPerMileVsKmChart />
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection title={t("references.title")}>
        <p>{t("references.citation")}</p>
        <p className="text-sm opacity-70">{t("references.note")}</p>
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
