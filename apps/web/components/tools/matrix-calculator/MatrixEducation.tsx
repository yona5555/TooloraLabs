import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import SectionCard from "@/components/tool-ui/SectionCard";
import MatrixLive3D from "./MatrixLive3D";
import MatrixBasisDragLab from "./MatrixBasisDragLab";
import MatrixDeterminantFormula from "./MatrixDeterminantFormula";
import MatrixDeterminantZoneStrip from "./MatrixDeterminantZoneStrip";
import MatrixDetSensitivityTrio from "./MatrixDetSensitivityTrio";
import MatrixCompositionFlow from "./MatrixCompositionFlow";
import MatrixCommutativityBars from "./MatrixCommutativityBars";
import MatrixInverseEquivalence from "./MatrixInverseEquivalence";
import MatrixConditionGauge from "./MatrixConditionGauge";
import MatrixTransposeCards from "./MatrixTransposeCards";
import MatrixEigenCurve from "./MatrixEigenCurve";
import MatrixStretchRankedBars from "./MatrixStretchRankedBars";
import MatrixPowerLogScale from "./MatrixPowerLogScale";

type ExampleRow = { calculation: string; result: string };
type ApplicationItem = { title: string; description: string };

export default async function MatrixEducation() {
  const t = await getTranslations("tools.matrix-calculator.education");
  const t3 = await getTranslations("tools.matrix-calculator.live3d");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const applicationItems = t.raw("applications.items") as ApplicationItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <SectionCard title={t3("cardTitle")}>
          <MatrixLive3D />
        </SectionCard>
        <p>{t("intro.paragraph2")}</p>
        <p>{t("intro.paragraph3")}</p>
        <MatrixBasisDragLab />
      </InfoSection>

      <InfoSection title={t("variables.title")}>
        <p>{t("variables.intro")}</p>

        <div>
          <h3 className="font-semibold">{t("variables.determinant.title")}</h3>
          <p className="mt-1">{t("variables.determinant.description")}</p>
          <div className="mt-4 space-y-6">
            <MatrixDeterminantFormula />
            <MatrixDeterminantZoneStrip />
            <MatrixDetSensitivityTrio />
          </div>
        </div>

        <div>
          <h3 className="font-semibold">{t("variables.composition.title")}</h3>
          <p className="mt-1">{t("variables.composition.description")}</p>
          <div className="mt-4 space-y-6">
            <MatrixCompositionFlow />
            <MatrixCommutativityBars />
          </div>
        </div>

        <div>
          <h3 className="font-semibold">{t("variables.inverse.title")}</h3>
          <p className="mt-1">{t("variables.inverse.description")}</p>
          <div className="mt-4 space-y-6">
            <MatrixInverseEquivalence />
            <MatrixConditionGauge />
          </div>
        </div>

        <div>
          <h3 className="font-semibold">{t("variables.transpose.title")}</h3>
          <p className="mt-1">{t("variables.transpose.description")}</p>
          <div className="mt-4">
            <MatrixTransposeCards />
          </div>
        </div>
      </InfoSection>

      <AdSpace variant="leaderboard" />

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
                  <td className="px-3 py-2.5 font-mono font-semibold">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-6">
          <MatrixEigenCurve />
          <MatrixStretchRankedBars />
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
        <MatrixPowerLogScale />
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
        <div>
          <h3 className="font-semibold">{t("behindTheTool.computationalEra.title")}</h3>
          <p className="mt-2">{t("behindTheTool.computationalEra.paragraph")}</p>
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
