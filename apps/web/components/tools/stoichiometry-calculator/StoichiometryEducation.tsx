import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import StoichiometryEquationDiagram from "./StoichiometryEquationDiagram";
import StoichiometryConversionPathDiagram from "./StoichiometryConversionPathDiagram";
import StoichiometryMoleRatioDiagram from "./StoichiometryMoleRatioDiagram";
import StoichiometryMolarMassBridgeDiagram from "./StoichiometryMolarMassBridgeDiagram";
import StoichiometryUnitsCompareDiagram from "./StoichiometryUnitsCompareDiagram";

type ExampleRow = { calculation: string; result: string };

export default async function StoichiometryEducation() {
  const t = await getTranslations("tools.stoichiometry-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <StoichiometryEquationDiagram knownCoefficient="2" knownFormula="H₂" targetCoefficient="2" targetFormula="H₂O" caption={t("intro.equation.caption")} />
        <p>{t("intro.paragraph2")}</p>
        <StoichiometryConversionPathDiagram
          steps={[
            { label: t("intro.roadmap.knownGrams"), value: "4 g" },
            { label: t("intro.roadmap.knownMoles"), value: "2 mol" },
            { label: t("intro.roadmap.targetMoles"), value: "2 mol" },
            { label: t("intro.roadmap.targetGrams"), value: "36 g" },
          ]}
          caption={t("intro.roadmap.caption")}
        />
        <p>{t("intro.paragraph3")}</p>
        <StoichiometryMoleRatioDiagram caption={t("intro.moleRatio.caption")} />
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
          <h3 className="font-semibold">{t("behindTheTool.bridgeSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.bridgeSection.paragraph")}</p>
          <StoichiometryMolarMassBridgeDiagram
            gramsLabel={t("behindTheTool.bridgeSection.grams")}
            molesLabel={t("behindTheTool.bridgeSection.moles")}
            bridgeLabel={t("behindTheTool.bridgeSection.bridgeLabel")}
            caption={t("behindTheTool.bridgeSection.caption")}
          />
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.unitsCompareSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.unitsCompareSection.paragraph")}</p>
          <StoichiometryUnitsCompareDiagram
            labels={[
              t("behindTheTool.unitsCompareSection.h2"),
              t("behindTheTool.unitsCompareSection.h2o"),
              t("behindTheTool.unitsCompareSection.nacl"),
              t("behindTheTool.unitsCompareSection.glucose"),
            ]}
            caption={t("behindTheTool.unitsCompareSection.caption")}
          />
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
