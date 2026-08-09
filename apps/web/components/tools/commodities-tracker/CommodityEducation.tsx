import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import CommoditySupplyDemandDiagram from "./CommoditySupplyDemandDiagram";

type ComparisonRow = { name: string; benchmark: string; mainDriver: string };

export default async function CommodityEducation() {
  const t = await getTranslations("tools.commodities-tracker.education");

  const comparisonRows = t.raw("comparison.rows") as ComparisonRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
        <p className="rounded-sm border border-current/20 px-4 py-3 text-sm">{t("intro.disclaimer")}</p>
      </InfoSection>

      <InfoSection title={t("pricing.title")}>
        <p>{t("pricing.paragraph1")}</p>
        <p>{t("pricing.paragraph2")}</p>
        <CommoditySupplyDemandDiagram
          axisPriceLabel={t("pricing.diagram.axisPrice")}
          axisQuantityLabel={t("pricing.diagram.axisQuantity")}
          supplyLabel={t("pricing.diagram.supply")}
          demandLabel={t("pricing.diagram.demand")}
          equilibriumLabel={t("pricing.diagram.equilibrium")}
          caption={t("pricing.diagram.caption")}
        />
      </InfoSection>

      <InfoSection title={t("comparison.title")}>
        <p>{t("comparison.intro")}</p>
        <div dir="ltr" className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-current/30 text-start">
                <th className="px-3 py-2 text-start font-semibold">{t("comparison.columnName")}</th>
                <th className="px-3 py-2 text-start font-semibold">{t("comparison.columnBenchmark")}</th>
                <th className="px-3 py-2 text-start font-semibold">{t("comparison.columnMainDriver")}</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.name} className="border-b border-current/10">
                  <td className="px-3 py-2.5 font-semibold">{row.name}</td>
                  <td className="px-3 py-2.5">{row.benchmark}</td>
                  <td className="px-3 py-2.5">{row.mainDriver}</td>
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
