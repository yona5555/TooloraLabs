import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import ScientificAngleExplorer from "./ScientificAngleExplorer";
import AngleModeEquivalence from "./AngleModeEquivalence";
import PowerRootBarChart from "./PowerRootBarChart";
import LogComparisonBarList from "./LogComparisonBarList";
import TrigWaveCurve from "./TrigWaveCurve";
import ExponentialTangentCurve from "./ExponentialTangentCurve";
import InverseTrigRangeZone from "./InverseTrigRangeZone";
import DerivativeSlopeDiagram from "./DerivativeSlopeDiagram";
import IntegralAreaDiagram from "./IntegralAreaDiagram";
import OrderOfOperationsStepper from "./OrderOfOperationsStepper";
import SignPolarityBalance from "./SignPolarityBalance";
import PercentFlowDiagram from "./PercentFlowDiagram";
import CombinatoricsTable from "./CombinatoricsTable";
import MathConstantsCards from "./MathConstantsCards";
import FactorialMagnitudeScale from "./FactorialMagnitudeScale";
import MemoryTimelineDiagram from "./MemoryTimelineDiagram";

type ExampleRow = { expression: string; result: string };

export default async function ScientificEducation() {
  const t = await getTranslations("tools.scientific-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <ScientificAngleExplorer />
        <p>{t("intro.paragraph2")}</p>
        <AngleModeEquivalence />
      </InfoSection>

      <InfoSection title={t("functionsPowerRoots.title")}>
        <p>{t("functionsPowerRoots.intro")}</p>
        <div className="space-y-6">
          <PowerRootBarChart />
          <LogComparisonBarList />
        </div>
      </InfoSection>

      <InfoSection title={t("functionsTrig.title")}>
        <p>{t("functionsTrig.intro")}</p>
        <div className="space-y-6">
          <TrigWaveCurve />
          <ExponentialTangentCurve />
          <InverseTrigRangeZone />
        </div>
      </InfoSection>

      <InfoSection title={t("calculusPreview.title")}>
        <p>{t("calculusPreview.intro")}</p>
        <div className="space-y-6">
          <DerivativeSlopeDiagram />
          <IntegralAreaDiagram />
        </div>
      </InfoSection>

      <InfoSection title={t("orderOfOperations.title")}>
        <p>{t("orderOfOperations.intro")}</p>
        <OrderOfOperationsStepper />
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection title={t("examples.title")}>
        <p>{t("examples.intro")}</p>
        <div dir="ltr" className="overflow-x-auto">
          <table className="w-full min-w-[360px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-current/30 text-start">
                <th className="px-3 py-2 text-start font-semibold">{t("examples.columnExpression")}</th>
                <th className="px-3 py-2 text-start font-semibold">{t("examples.columnResult")}</th>
              </tr>
            </thead>
            <tbody>
              {exampleRows.map((row) => (
                <tr key={row.expression} className="border-b border-current/10">
                  <td className="px-3 py-2.5 font-mono">{row.expression}</td>
                  <td className="px-3 py-2.5 font-mono font-semibold">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-6">
          <SignPolarityBalance />
          <PercentFlowDiagram />
        </div>
      </InfoSection>

      <InfoSection title={t("combinatoricsAndConstants.title")}>
        <p>{t("combinatoricsAndConstants.intro")}</p>
        <div className="space-y-6">
          <CombinatoricsTable />
          <MathConstantsCards />
          <FactorialMagnitudeScale />
        </div>
      </InfoSection>

      <InfoSection title={t("functionsMemory.title")}>
        <p>{t("functionsMemory.intro")}</p>
        <MemoryTimelineDiagram />
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
