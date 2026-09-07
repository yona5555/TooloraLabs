import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import MolarMassCompositionBarDiagram from "./MolarMassCompositionBarDiagram";
import MolarMassAtomicMassDiagram from "./MolarMassAtomicMassDiagram";
import MolarMassAvogadroDiagram from "./MolarMassAvogadroDiagram";
import MolarMassGroupNotationDiagram from "./MolarMassGroupNotationDiagram";
import MolarMassFormulaBreakdownDiagram from "./MolarMassFormulaBreakdownDiagram";

type ExampleRow = { calculation: string; result: string };

export default async function MolarMassEducation() {
  const t = await getTranslations("tools.molar-mass-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <MolarMassCompositionBarDiagram
          segments={[
            { symbol: "C", percent: 40 },
            { symbol: "H", percent: 6.7 },
            { symbol: "O", percent: 53.3 },
          ]}
          caption={t("intro.composition.caption")}
        />
        <p>{t("intro.paragraph2")}</p>
        <MolarMassAtomicMassDiagram
          caption={t("intro.atomicMass.caption")}
          isotopeLabels={[t("intro.atomicMass.isotope1"), t("intro.atomicMass.isotope2"), t("intro.atomicMass.isotope3")]}
        />
        <p>{t("intro.paragraph3")}</p>
        <MolarMassAvogadroDiagram caption={t("intro.avogadro.caption")} moleLabel={t("intro.avogadro.mole")} particleLabel={t("intro.avogadro.particles")} />
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
          <h3 className="font-semibold">{t("behindTheTool.groupSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.groupSection.paragraph")}</p>
          <MolarMassGroupNotationDiagram caption={t("behindTheTool.groupSection.caption")} />
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.parsingSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.parsingSection.paragraph")}</p>
          <MolarMassFormulaBreakdownDiagram
            elements={[
              { symbol: "C", count: 6 },
              { symbol: "H", count: 12 },
              { symbol: "O", count: 6 },
            ]}
            caption={t("behindTheTool.parsingSection.caption")}
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
