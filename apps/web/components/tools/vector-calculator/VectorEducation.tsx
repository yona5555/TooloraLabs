import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import VectorDiagram from "./VectorDiagram";
import VectorCrossDiagram from "./VectorCrossDiagram";
import VectorUnitDiagram from "./VectorUnitDiagram";
import VectorProjectionDiagram from "./VectorProjectionDiagram";

type ExampleRow = { calculation: string; result: string };
type ApplicationItem = { title: string; description: string };

export default async function VectorEducation() {
  const t = await getTranslations("tools.vector-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const applicationItems = t.raw("applications.items") as ApplicationItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
        <p>{t("intro.paragraph3")}</p>
      </InfoSection>

      <InfoSection title={t("variables.title")}>
        <p>{t("variables.intro")}</p>

        <div>
          <h3 className="font-semibold">{t("variables.difference.title")}</h3>
          <p className="mt-1">{t("variables.difference.description")}</p>
          <VectorDiagram
            ax={5}
            ay={4}
            bx={2}
            by={3}
            resultX={3}
            resultY={1}
            labelA="A"
            labelB="B"
            labelResult="A−B"
            resultColorClass="text-rose-500 dark:text-rose-400"
            caption={t("variables.difference.diagramCaption")}
          />
        </div>

        <div>
          <h3 className="font-semibold">{t("variables.crossProduct.title")}</h3>
          <p className="mt-1">{t("variables.crossProduct.description")}</p>
          <VectorCrossDiagram
            ax={2}
            ay={0}
            az={0}
            bx={0}
            by={2}
            bz={0}
            crossX={0}
            crossY={0}
            crossZ={4}
            labelA="A"
            labelB="B"
            labelCross="A×B"
            caption={t("variables.crossProduct.diagramCaption")}
          />
        </div>

        <div>
          <h3 className="font-semibold">{t("variables.unitVector.title")}</h3>
          <p className="mt-1">{t("variables.unitVector.description")}</p>
          <VectorUnitDiagram
            ax={3}
            ay={4}
            unitAX={0.6}
            unitAY={0.8}
            labelA="A"
            labelUnit="Â"
            caption={t("variables.unitVector.diagramCaption")}
          />
        </div>

        <div>
          <h3 className="font-semibold">{t("variables.projection.title")}</h3>
          <p className="mt-1">{t("variables.projection.description")}</p>
          <VectorProjectionDiagram
            ax={2}
            ay={3}
            bx={4}
            by={0}
            projectionX={2}
            projectionY={0}
            labelA="A"
            labelB="B"
            labelProjection={t("variables.projection.diagramLabel")}
            caption={t("variables.projection.diagramCaption")}
          />
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
                  <td className="px-3 py-2.5 font-mono font-semibold">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <VectorDiagram
            ax={30}
            ay={40}
            bx={20}
            by={-10}
            resultX={50}
            resultY={30}
            labelA={t("applications.forceExample.labelF1")}
            labelB={t("applications.forceExample.labelF2")}
            labelResult={t("applications.forceExample.labelResultant")}
            caption={t("applications.forceExample.diagramCaption")}
          />
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
