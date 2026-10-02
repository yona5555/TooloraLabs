import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import VolumeShapeDrag from "./VolumeShapeDrag";
import ActiveShapeFormulaDiagram from "./ActiveShapeFormulaDiagram";
import ShapeFamilyTable from "./ShapeFamilyTable";
import ComputationStepsTimeline from "./ComputationStepsTimeline";
import DimensionComparisonCards from "./DimensionComparisonCards";
import ShapeVolumeComparisonBarChart from "./ShapeVolumeComparisonBarChart";
import SameSizeDifferentShapeBalance from "./SameSizeDifferentShapeBalance";
import VolumeToSurfaceAreaRatioZone from "./VolumeToSurfaceAreaRatioZone";
import IsoperimetricCompactnessZone from "./IsoperimetricCompactnessZone";
import DimensionSensitivityTrio from "./DimensionSensitivityTrio";
import VolumeVsScaleFactorCurve from "./VolumeVsScaleFactorCurve";
import VolumeDoublingStepsDiagram from "./VolumeDoublingStepsDiagram";
import CompositeVolumeFlowDiagram from "./CompositeVolumeFlowDiagram";
import CapacityFlowDiagram from "./CapacityFlowDiagram";
import UnitConversionEquivalence from "./UnitConversionEquivalence";
import RealWorldVolumeScaleBar from "./RealWorldVolumeScaleBar";

type ExampleRow = { calculation: string; result: string };
type VariableItem = { name: string; description: string };
type ApplicationItem = { title: string; description: string };

export default async function VolumeEducation() {
  const t = await getTranslations("tools.volume-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const variableItems = t.raw("variables.items") as VariableItem[];
  const applicationItems = t.raw("applications.items") as ApplicationItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <VolumeShapeDrag />
        <p>{t("intro.paragraph2")}</p>
        <div className="space-y-6">
          <ActiveShapeFormulaDiagram />
          <ComputationStepsTimeline />
        </div>
      </InfoSection>

      <InfoSection title={t("shapeFamilySection.title")}>
        <p>{t("shapeFamilySection.intro")}</p>
        <div className="space-y-6">
          <ShapeFamilyTable />
          <DimensionComparisonCards />
        </div>
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection title={t("comparisonsSection.title")}>
        <p>{t("comparisonsSection.intro")}</p>
        <div className="space-y-6">
          <ShapeVolumeComparisonBarChart />
          <SameSizeDifferentShapeBalance />
          <VolumeToSurfaceAreaRatioZone />
          <IsoperimetricCompactnessZone />
        </div>
      </InfoSection>

      <InfoSection title={t("variables.title")}>
        <p>{t("variables.intro")}</p>
        <dl className="space-y-4">
          {variableItems.map((item) => (
            <div key={item.name}>
              <dt className="font-semibold">{item.name}</dt>
              <dd className="mt-1">{item.description}</dd>
            </div>
          ))}
        </dl>
        <div className="space-y-6">
          <DimensionSensitivityTrio />
          <VolumeVsScaleFactorCurve />
          <VolumeDoublingStepsDiagram />
        </div>
      </InfoSection>

      <InfoSection title={t("examples.title")}>
        <p>{t("examples.intro")}</p>
        <div dir="ltr" className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-current/30 text-start">
                <th className="px-3 py-2 text-start font-semibold">{t("examples.columnCalculation")}</th>
                <th className="px-3 py-2 text-start font-semibold">{t("examples.columnResult")}</th>
              </tr>
            </thead>
            <tbody>
              {exampleRows.map((row) => (
                <tr key={row.calculation} className="border-b border-current/10">
                  <td className="px-3 py-2.5">{row.calculation}</td>
                  <td className="px-3 py-2.5 font-semibold">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-6">
          <CompositeVolumeFlowDiagram />
          <CapacityFlowDiagram />
        </div>
      </InfoSection>

      <InfoSection title={t("applications.title")}>
        <p>{t("applications.intro")}</p>
        <div className="space-y-4">
          {applicationItems.map((item) => (
            <div key={item.title}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <UnitConversionEquivalence />
          <RealWorldVolumeScaleBar />
        </div>
      </InfoSection>

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
