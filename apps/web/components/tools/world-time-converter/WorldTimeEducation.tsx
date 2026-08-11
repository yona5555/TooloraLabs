import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import TimeZoneConceptDiagram from "./TimeZoneConceptDiagram";

type ComparisonRow = { name: string; offset: string; dst: string };

export default async function WorldTimeEducation() {
  const t = await getTranslations("tools.world-time-converter.education");

  const comparisonRows = t.raw("comparison.rows") as ComparisonRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
        <TimeZoneConceptDiagram sameInstantLabel={t("intro.diagram.sameInstant")} caption={t("intro.diagram.caption")} />
      </InfoSection>

      <InfoSection title={t("comparison.title")}>
        <p>{t("comparison.intro")}</p>
        <div dir="ltr" className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-current/30 text-start">
                <th className="px-3 py-2 text-start font-semibold">{t("comparison.columnName")}</th>
                <th className="px-3 py-2 text-start font-semibold">{t("comparison.columnOffset")}</th>
                <th className="px-3 py-2 text-start font-semibold">{t("comparison.columnDst")}</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.name} className="border-b border-current/10">
                  <td className="px-3 py-2.5">{row.name}</td>
                  <td className="px-3 py-2.5 font-mono">{row.offset}</td>
                  <td className="px-3 py-2.5">{row.dst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoSection>

      <InfoSection title={t("dst.title")}>
        <p>{t("dst.paragraph1")}</p>
        <p>{t("dst.paragraph2")}</p>
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
          <h3 className="font-semibold">{t("behindTheTool.equipment.title")}</h3>
          <p className="mt-2">{t("behindTheTool.equipment.paragraph")}</p>
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
