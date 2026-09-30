import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import AreaRectangleDrag from "./AreaRectangleDrag";
import ShapeFamilyTable from "./ShapeFamilyTable";
import SquareFormulaDiagram from "./SquareFormulaDiagram";
import TriangleFormulaDiagram from "./TriangleFormulaDiagram";
import CircleFormulaDiagram from "./CircleFormulaDiagram";
import EllipseFormulaDiagram from "./EllipseFormulaDiagram";
import TrapezoidFormulaDiagram from "./TrapezoidFormulaDiagram";
import ParallelogramFormulaDiagram from "./ParallelogramFormulaDiagram";
import SectorFormulaDiagram from "./SectorFormulaDiagram";
import TrapezoidToRectangleTransform from "./TrapezoidToRectangleTransform";
import UnitConversionEquivalence from "./UnitConversionEquivalence";
import ShapeAreaComparisonBarChart from "./ShapeAreaComparisonBarChart";
import CompositeAreaFlowDiagram from "./CompositeAreaFlowDiagram";
import PerimeterVsAreaComparison from "./PerimeterVsAreaComparison";
import CircleVsSquareEfficiency from "./CircleVsSquareEfficiency";
import RealWorldAreaScaleBar from "./RealWorldAreaScaleBar";

type ExampleRow = { calculation: string; result: string };
type VariableItem = { name: string; description: string };
type ApplicationItem = { title: string; description: string };

export default async function AreaEducation() {
  const t = await getTranslations("tools.area-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const variableItems = t.raw("variables.items") as VariableItem[];
  const applicationItems = t.raw("applications.items") as ApplicationItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <AreaRectangleDrag />
        <p>{t("intro.paragraph2")}</p>
        <ShapeFamilyTable />
      </InfoSection>

      <InfoSection title={t("basicFormulas.title")}>
        <p>{t("basicFormulas.intro")}</p>
        <div className="space-y-6">
          <SquareFormulaDiagram />
          <TriangleFormulaDiagram />
          <CircleFormulaDiagram />
          <EllipseFormulaDiagram />
        </div>
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection title={t("moreFormulas.title")}>
        <p>{t("moreFormulas.intro")}</p>
        <div className="space-y-6">
          <TrapezoidFormulaDiagram />
          <ParallelogramFormulaDiagram />
          <SectorFormulaDiagram />
          <TrapezoidToRectangleTransform />
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
        <UnitConversionEquivalence />
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
          <ShapeAreaComparisonBarChart />
          <CompositeAreaFlowDiagram />
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
          <PerimeterVsAreaComparison />
          <CircleVsSquareEfficiency />
          <RealWorldAreaScaleBar />
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
