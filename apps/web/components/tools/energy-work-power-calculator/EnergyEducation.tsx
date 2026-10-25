import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import SectionCard from "@/components/tool-ui/SectionCard";
import EnergyLive3D from "./EnergyLive3D";
import EnergyDropLab from "./EnergyDropLab";
import EnergyWorkAngleTrend from "./EnergyWorkAngleTrend";
import EnergyFormulaDiagram from "./EnergyFormulaDiagram";
import EnergyLogScale from "./EnergyLogScale";
import EnergyEquivalents from "./EnergyEquivalents";
import EnergySpeedTrio from "./EnergySpeedTrio";
import EnergyPowerRanking from "./EnergyPowerRanking";
import EnergyPowerSteps from "./EnergyPowerSteps";

type ExampleRow = { calculation: string; result: string };

export default async function EnergyEducation() {
  const t = await getTranslations("tools.energy-work-power-calculator.education");
  const t3 = await getTranslations("tools.energy-work-power-calculator.live3d");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <SectionCard title={t3("cardTitle")}>
          <EnergyLive3D camera={[0, 2.2, 8.6]} capHeight />
        </SectionCard>
        <div className="space-y-6">
          <EnergyDropLab />
          <EnergyWorkAngleTrend />
        </div>
        <p>{t("intro.paragraph2")}</p>
        <p>{t("intro.paragraph3")}</p>
        <EnergyFormulaDiagram />
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
        <EnergyLogScale />
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
        <div>
          <h3 className="font-semibold">{t("behindTheTool.magnitudeSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.magnitudeSection.paragraph")}</p>
          <div className="mt-4">
            <EnergyEquivalents />
          </div>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.kineticSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.kineticSection.paragraph")}</p>
          <div className="mt-4">
            <EnergySpeedTrio />
          </div>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.potentialSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.potentialSection.paragraph")}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.powerRateSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.powerRateSection.paragraph")}</p>
          <div className="mt-4 space-y-6">
            <EnergyPowerSteps />
            <EnergyPowerRanking />
          </div>
        </div>
        <AcademicPathSection
          title={t("behindTheTool.academicPath.title")}
          intro={t("behindTheTool.academicPath.intro")}
          universities={universities}
        />
      </InfoSection>

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
