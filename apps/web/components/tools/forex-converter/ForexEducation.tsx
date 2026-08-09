import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import ForexExchangeSystemDiagram from "./ForexExchangeSystemDiagram";

type TimelineEra = { year: string; title: string; note: string };
type RegimeRow = { regime: string; example: string; description: string };

export default async function ForexEducation() {
  const t = await getTranslations("tools.forex-converter.education");

  const eras = t.raw("history.diagram.eras") as TimelineEra[];
  const regimeRows = t.raw("regimes.rows") as RegimeRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
        <p className="rounded-sm border border-current/20 px-4 py-3 text-sm">{t("intro.disclaimer")}</p>
      </InfoSection>

      <InfoSection title={t("history.title")}>
        <p>{t("history.paragraph1")}</p>
        <p>{t("history.paragraph2")}</p>
        <ForexExchangeSystemDiagram eras={eras} caption={t("history.diagram.caption")} />
      </InfoSection>

      <InfoSection title={t("regimes.title")}>
        <p>{t("regimes.intro")}</p>
        <div dir="ltr" className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-current/30 text-start">
                <th className="px-3 py-2 text-start font-semibold">{t("regimes.columnRegime")}</th>
                <th className="px-3 py-2 text-start font-semibold">{t("regimes.columnExample")}</th>
                <th className="px-3 py-2 text-start font-semibold">{t("regimes.columnDescription")}</th>
              </tr>
            </thead>
            <tbody>
              {regimeRows.map((row) => (
                <tr key={row.regime} className="border-b border-current/10">
                  <td className="px-3 py-2.5 font-semibold">{row.regime}</td>
                  <td className="px-3 py-2.5">{row.example}</td>
                  <td className="px-3 py-2.5">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoSection>

      <InfoSection title={t("risks.title")}>
        <p>{t("risks.paragraph1")}</p>
        <p>{t("risks.paragraph2")}</p>
        <p>{t("risks.paragraph3")}</p>
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection id="faq" title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
      </InfoSection>

      <InfoSection title={t("behindTheTool.title")}>
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
