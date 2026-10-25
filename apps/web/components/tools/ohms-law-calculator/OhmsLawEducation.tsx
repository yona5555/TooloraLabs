import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import SectionCard from "@/components/tool-ui/SectionCard";
import OhmsLive3D from "./OhmsLive3D";
import OhmsDimmerLab from "./OhmsDimmerLab";
import OhmsFormulaDiagram from "./OhmsFormulaDiagram";
import OhmsPowerRoutes from "./OhmsPowerRoutes";
import OhmsResistanceScale from "./OhmsResistanceScale";
import OhmsViTrend from "./OhmsViTrend";
import OhmsResistanceTrio from "./OhmsResistanceTrio";
import OhmsResistorRating from "./OhmsResistorRating";
import OhmsFuseSteps from "./OhmsFuseSteps";

type ExampleRow = { calculation: string; result: string };

export default async function OhmsLawEducation() {
  const t = await getTranslations("tools.ohms-law-calculator.education");
  const t3 = await getTranslations("tools.ohms-law-calculator.live3d");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <SectionCard title={t3("cardTitle")}>
          <OhmsLive3D camera={[0, 0.4, 8]} capHeight />
        </SectionCard>
        <div className="space-y-6">
          <OhmsDimmerLab />
          <OhmsFormulaDiagram />
        </div>
        <p>{t("intro.paragraph2")}</p>
        <p>{t("intro.paragraph3")}</p>
        <OhmsPowerRoutes />
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
        <OhmsResistanceScale />
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
          <h3 className="font-semibold">{t("behindTheTool.circuitSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.circuitSection.paragraph")}</p>
          <div className="mt-4 space-y-6">
            <OhmsViTrend />
            <OhmsResistanceTrio />
          </div>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.powerFormulasSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.powerFormulasSection.paragraph")}</p>
          <div className="mt-4 space-y-6">
            <OhmsResistorRating />
            <OhmsFuseSteps />
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
