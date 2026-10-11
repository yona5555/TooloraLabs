import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import SectionCard from "@/components/tool-ui/SectionCard";
import DensityLive3D from "./DensityLive3D";
import DensityFloatLab from "./DensityFloatLab";
import DensityFormulaDiagram from "./DensityFormulaDiagram";
import DensityVolumeTrio from "./DensityVolumeTrio";
import DensityMaterialRanking from "./DensityMaterialRanking";
import DensityUnitEquivalence from "./DensityUnitEquivalence";
import DensityBuoyancyBalance from "./DensityBuoyancyBalance";
import DensityFluidDepthBars from "./DensityFluidDepthBars";
import DensityWaterTemperatureTrend from "./DensityWaterTemperatureTrend";

type ExampleRow = { calculation: string; result: string };

export default async function DensityEducation() {
  const t = await getTranslations("tools.density-calculator.education");
  const t3 = await getTranslations("tools.density-calculator.live3d");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <SectionCard title={t3("cardTitle")}>
          <DensityLive3D capHeight />
        </SectionCard>
        <DensityFloatLab />
        <p>{t("intro.paragraph2")}</p>
        <div className="space-y-6">
          <DensityBuoyancyBalance />
          <DensityFluidDepthBars />
        </div>
        <p>{t("intro.paragraph3")}</p>
        <DensityMaterialRanking />
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
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection id="faq" title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
        <DensityWaterTemperatureTrend />
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
          <h3 className="font-semibold">{t("behindTheTool.formulaSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.formulaSection.paragraph")}</p>
          <div className="mt-4">
            <DensityFormulaDiagram />
          </div>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.blockSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.blockSection.paragraph")}</p>
          <div className="mt-4">
            <DensityVolumeTrio />
          </div>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.unitsSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.unitsSection.paragraph")}</p>
          <div className="mt-4">
            <DensityUnitEquivalence />
          </div>
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
