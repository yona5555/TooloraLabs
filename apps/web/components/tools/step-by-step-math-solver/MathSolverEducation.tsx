import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import MathSolverGraphDrag from "./MathSolverGraphDrag";
import EquationBalanceDiagram from "./EquationBalanceDiagram";
import SolveFlowDiagram from "./SolveFlowDiagram";
import RadialProgressGauges from "./RadialProgressGauges";
import NewtonIterationsDiagram from "./NewtonIterationsDiagram";
import IntersectionAreaDiagram from "./IntersectionAreaDiagram";
import SixMethodsMatrix from "./SixMethodsMatrix";
import RootsVsParameterCurve from "./RootsVsParameterCurve";
import ComplexPlaneDiagram from "./ComplexPlaneDiagram";
import LawsCard from "./LawsCard";
import NotationMappingDiagram from "./NotationMappingDiagram";
import NumberLineSolutionSet from "./NumberLineSolutionSet";
import VerificationColumnsDiagram from "./VerificationColumnsDiagram";
import SensitivityHeatmap from "./SensitivityHeatmap";
import VietaRectangleDiagram from "./VietaRectangleDiagram";
import UnitCircleWave from "./UnitCircleWave";

type ExampleRow = { calculation: string; result: string };
type VariableItem = { name: string; description: string };
type ApplicationItem = { title: string; description: string };

export default async function MathSolverEducation() {
  const t = await getTranslations("tools.step-by-step-math-solver.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const variableItems = t.raw("variables.items") as VariableItem[];
  const applicationItems = t.raw("applications.items") as ApplicationItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <MathSolverGraphDrag />

      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
        <div className="space-y-6">
          <SolveFlowDiagram />
          <EquationBalanceDiagram />
        </div>
      </InfoSection>

      <InfoSection title={t("diagnosticsSection.title")}>
        <p>{t("diagnosticsSection.intro")}</p>
        <div className="space-y-6">
          <LawsCard />
          <SixMethodsMatrix />
          <VerificationColumnsDiagram />
        </div>
      </InfoSection>

      <AdSpace variant="leaderboard" />

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
          <RadialProgressGauges />
          <NewtonIterationsDiagram />
          <RootsVsParameterCurve />
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
          <IntersectionAreaDiagram />
          <NumberLineSolutionSet />
          <NotationMappingDiagram />
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
          <ComplexPlaneDiagram />
          <SensitivityHeatmap />
          <VietaRectangleDiagram />
          <UnitCircleWave />
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
