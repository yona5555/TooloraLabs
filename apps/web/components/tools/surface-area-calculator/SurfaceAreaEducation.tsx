import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import SectionCard from "@/components/tool-ui/SectionCard";
import { SurfaceAreaLive3DLive } from "./SurfaceAreaLive3D";
import ActiveShapeFormulaDiagram from "./ActiveShapeFormulaDiagram";
import ShapeFamilyTable from "./ShapeFamilyTable";
import ComputationStepsTimeline from "./ComputationStepsTimeline";
import DimensionComparisonCards from "./DimensionComparisonCards";
import ShapeSurfaceAreaComparisonBarChart from "./ShapeSurfaceAreaComparisonBarChart";
import SameSizeDifferentShapeBalance from "./SameSizeDifferentShapeBalance";
import SurfaceToVolumeRatioZoneStrip from "./SurfaceToVolumeRatioZoneStrip";
import IsoperimetricCompactnessZone from "./IsoperimetricCompactnessZone";
import DimensionSensitivityTrio from "./DimensionSensitivityTrio";
import SurfaceAreaVsScaleFactorCurve from "./SurfaceAreaVsScaleFactorCurve";
import SurfaceAreaDoublingStepsDiagram from "./SurfaceAreaDoublingStepsDiagram";
import CompositeSurfaceAreaFlowDiagram from "./CompositeSurfaceAreaFlowDiagram";
import PaintCoverageFlowDiagram from "./PaintCoverageFlowDiagram";
import UnitConversionEquivalence from "./UnitConversionEquivalence";
import RealWorldSurfaceAreaScaleBar from "./RealWorldSurfaceAreaScaleBar";
import SurfaceAreaMobileRow from "./SurfaceAreaMobileRow";
import SurfaceAreaMobile3DRow from "./SurfaceAreaMobile3DRow";

type ExampleRow = { calculation: string; result: string };
type VariableItem = { name: string; description: string };
type ApplicationItem = { title: string; description: string };

export default async function SurfaceAreaEducation() {
  const t = await getTranslations("tools.surface-area-calculator.education");
  const tLive = await getTranslations("tools.surface-area-calculator.live3d");
  const tc = await getTranslations("common");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const variableItems = t.raw("variables.items") as VariableItem[];
  const applicationItems = t.raw("applications.items") as ApplicationItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  const exampleRowsTable = (
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
  );

  /*
   * Phone standard (<768px, owner-approved §2 2026-10-22, this tool only): every encyclopedic
   * section below the fold becomes one collapsed 44px row ("+" marker, native <details>) instead
   * of the "A4 paper" desktop layout — same translated text, just reusing the data already fetched
   * above instead of a second i18n fetch. The 3D scene (intro section) is the one explicit
   * exception that doesn't mount until its own row opens (point 7); every other indicator here is
   * plain SVG, cheap enough to render same as before.
   */
  const mobileSections = (
    <div className="block md:hidden">
      <SurfaceAreaMobileRow title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p className="mt-2">{t("intro.paragraph2")}</p>
        <div className="mt-3 space-y-4">
          <ActiveShapeFormulaDiagram />
          <ComputationStepsTimeline />
        </div>
      </SurfaceAreaMobileRow>
      <SurfaceAreaMobile3DRow title={tLive("educationTitle")} />
      <SurfaceAreaMobileRow title={t("basicFormulas.title")}>
        <p>{t("basicFormulas.intro")}</p>
        <div className="mt-3 space-y-4">
          <ShapeFamilyTable />
          <DimensionComparisonCards />
        </div>
      </SurfaceAreaMobileRow>
      {/* Point 9: one 300×250 ad slot between the collapsed rows, height reserved up front so it never shifts content in (zero CLS). */}
      <div className="flex flex-col items-center gap-1.5 border-b border-zinc-200 py-3 dark:border-zinc-800">
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-600">{tc("sponsoredLabel")}</p>
        <div style={{ width: 300, height: 250, minWidth: 300, minHeight: 250 }} className="flex items-center justify-center rounded-xl border border-dashed border-zinc-300 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:text-zinc-600">
          {tc("adSpace")}
        </div>
      </div>

      <SurfaceAreaMobileRow title={t("moreFormulas.title")}>
        <p>{t("moreFormulas.intro")}</p>
        <div className="mt-3 space-y-4">
          <ShapeSurfaceAreaComparisonBarChart />
          <SameSizeDifferentShapeBalance />
          <SurfaceToVolumeRatioZoneStrip />
          <IsoperimetricCompactnessZone />
        </div>
      </SurfaceAreaMobileRow>
      <SurfaceAreaMobileRow title={t("variables.title")}>
        <p>{t("variables.intro")}</p>
        <dl className="mt-2 space-y-3">
          {variableItems.map((item) => (
            <div key={item.name}>
              <dt className="font-semibold">{item.name}</dt>
              <dd className="mt-0.5">{item.description}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 space-y-4">
          <DimensionSensitivityTrio />
          <SurfaceAreaVsScaleFactorCurve />
          <SurfaceAreaDoublingStepsDiagram />
        </div>
      </SurfaceAreaMobileRow>
      <SurfaceAreaMobileRow title={t("examples.title")}>
        <p>{t("examples.intro")}</p>
        <div className="mt-3">{exampleRowsTable}</div>
        <div className="mt-3 space-y-4">
          <CompositeSurfaceAreaFlowDiagram />
          <PaintCoverageFlowDiagram />
        </div>
      </SurfaceAreaMobileRow>
      <SurfaceAreaMobileRow title={t("applications.title")}>
        <p>{t("applications.intro")}</p>
        <div className="mt-2 space-y-3">
          {applicationItems.map((item) => (
            <div key={item.title}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-0.5">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-4">
          <UnitConversionEquivalence />
          <RealWorldSurfaceAreaScaleBar />
        </div>
      </SurfaceAreaMobileRow>
      <SurfaceAreaMobileRow title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
      </SurfaceAreaMobileRow>
      <SurfaceAreaMobileRow title={t("behindTheTool.title")}>
        <h3 className="font-semibold">{t("behindTheTool.history.title")}</h3>
        <p className="mt-1">{t("behindTheTool.history.paragraph")}</p>
        <h3 className="mt-3 font-semibold">{t("behindTheTool.modernDevelopments.title")}</h3>
        <p className="mt-1">{t("behindTheTool.modernDevelopments.paragraph")}</p>
        <div className="mt-3">
          <AcademicPathSection
            title={t("behindTheTool.academicPath.title")}
            intro={t("behindTheTool.academicPath.intro")}
            universities={universities}
          />
        </div>
      </SurfaceAreaMobileRow>
      <SurfaceAreaMobileRow title={t("references.title")}>
        <p>{t("references.citation")}</p>
        <p className="mt-1 text-xs opacity-70">{t("references.note")}</p>
        <a
          href={t("references.url")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex rounded-sm border border-current/40 px-4 py-2 text-xs font-semibold no-underline transition hover:bg-current/5"
        >
          {t("references.readOriginal")}
        </a>
      </SurfaceAreaMobileRow>
    </div>
  );

  return (
    <>
      {mobileSections}
      <div className="hidden md:block">
        <EncyclopediaPaper>
          <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <SectionCard title={tLive("educationTitle")}>
          <SurfaceAreaLive3DLive />
        </SectionCard>
        <p>{t("intro.paragraph2")}</p>
        <div className="space-y-6">
          <ActiveShapeFormulaDiagram />
          <ComputationStepsTimeline />
        </div>
      </InfoSection>

      <InfoSection title={t("basicFormulas.title")}>
        <p>{t("basicFormulas.intro")}</p>
        <div className="space-y-6">
          <ShapeFamilyTable />
          <DimensionComparisonCards />
        </div>
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection title={t("moreFormulas.title")}>
        <p>{t("moreFormulas.intro")}</p>
        <div className="space-y-6">
          <ShapeSurfaceAreaComparisonBarChart />
          <SameSizeDifferentShapeBalance />
          <SurfaceToVolumeRatioZoneStrip />
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
          <SurfaceAreaVsScaleFactorCurve />
          <SurfaceAreaDoublingStepsDiagram />
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
          <CompositeSurfaceAreaFlowDiagram />
          <PaintCoverageFlowDiagram />
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
          <RealWorldSurfaceAreaScaleBar />
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
      </div>
    </>
  );
}
