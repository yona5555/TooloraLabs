import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import SectionCard from "@/components/tool-ui/SectionCard";
import VectorLive3D from "./VectorLive3D";
import VectorDragLab from "./VectorDragLab";
import VectorAngleGauge from "./VectorAngleGauge";
import VectorDotFormulaDiagram from "./VectorDotFormulaDiagram";
import VectorCrossStepsDiagram from "./VectorCrossStepsDiagram";
import VectorProjectionFlow from "./VectorProjectionFlow";
import VectorDirectionDonut from "./VectorDirectionDonut";
import VectorLagrangeStackedBar from "./VectorLagrangeStackedBar";
import VectorDotAngleCurve from "./VectorDotAngleCurve";
import VectorCosineZoneStrip from "./VectorCosineZoneStrip";
import VectorTriangleBalance from "./VectorTriangleBalance";
import VectorMagnitudeRankedBars from "./VectorMagnitudeRankedBars";
import VectorScaleSensitivityTrio from "./VectorScaleSensitivityTrio";

type ExampleRow = { calculation: string; result: string };
type ApplicationItem = { title: string; description: string };

export default async function VectorEducation() {
  const t = await getTranslations("tools.vector-calculator.education");
  const tLive = await getTranslations("tools.vector-calculator.live3d");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const applicationItems = t.raw("applications.items") as ApplicationItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <SectionCard title={tLive("educationTitle")}>
          <VectorLive3D />
        </SectionCard>
        <p>{t("intro.paragraph2")}</p>
        <VectorDragLab />
        <p>{t("intro.paragraph3")}</p>
        <VectorAngleGauge />
      </InfoSection>

      <InfoSection title={t("variables.title")}>
        <p>{t("variables.intro")}</p>

        <div>
          <h3 className="font-semibold">{t("variables.difference.title")}</h3>
          <p className="mt-1">{t("variables.difference.description")}</p>
          <div className="mt-4 space-y-6">
            <VectorMagnitudeRankedBars />
            <VectorTriangleBalance />
          </div>
        </div>

        <div>
          <h3 className="font-semibold">{t("variables.crossProduct.title")}</h3>
          <p className="mt-1">{t("variables.crossProduct.description")}</p>
          <div className="mt-4 space-y-6">
            <VectorCrossStepsDiagram />
            <VectorLagrangeStackedBar />
          </div>
        </div>

        <div>
          <h3 className="font-semibold">{t("variables.unitVector.title")}</h3>
          <p className="mt-1">{t("variables.unitVector.description")}</p>
          <div className="mt-4">
            <VectorDirectionDonut />
          </div>
        </div>

        <div>
          <h3 className="font-semibold">{t("variables.projection.title")}</h3>
          <p className="mt-1">{t("variables.projection.description")}</p>
          <div className="mt-4">
            <VectorProjectionFlow />
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
          <VectorDotFormulaDiagram />
          <VectorDotAngleCurve />
          <VectorCosineZoneStrip />
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

        <div>
          <h3 className="font-semibold">{t("applications.forceExample.title")}</h3>
          <p className="mt-1">{t("applications.forceExample.description")}</p>
          <div className="mt-4">
            <VectorScaleSensitivityTrio />
          </div>
        </div>
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
