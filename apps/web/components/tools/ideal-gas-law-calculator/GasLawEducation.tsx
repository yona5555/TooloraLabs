import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import GasCylinderDiagram from "./GasCylinderDiagram";
import GasPVCurveDiagram from "./GasPVCurveDiagram";
import GasStpReferenceDiagram from "./GasStpReferenceDiagram";
import GasPressureGaugeDiagram from "./GasPressureGaugeDiagram";
import GasVariablesDiagram from "./GasVariablesDiagram";

type ExampleRow = { calculation: string; result: string };

export default async function GasLawEducation() {
  const t = await getTranslations("tools.ideal-gas-law-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <div className="flex justify-center">
          <GasCylinderDiagram volumeLiters={22.414} moles={1} temperatureKelvin={273.15} caption={t("intro.diagram.caption")} />
        </div>
        <p>{t("intro.paragraph2")}</p>
        <GasPVCurveDiagram xLabel={t("intro.pvCurve.xLabel")} yLabel={t("intro.pvCurve.yLabel")} caption={t("intro.pvCurve.caption")} />
        <p>{t("intro.paragraph3")}</p>
        <GasStpReferenceDiagram label={t("intro.stpReference.label")} caption={t("intro.stpReference.caption")} />
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
          <h3 className="font-semibold">{t("behindTheTool.pressureGaugeSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.pressureGaugeSection.paragraph")}</p>
          <GasPressureGaugeDiagram pressureAtm={1} label="1 atm" caption={t("behindTheTool.pressureGaugeSection.caption")} />
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.variablesSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.variablesSection.paragraph")}</p>
          <GasVariablesDiagram
            solved="volume"
            labels={{ pressure: "P", volume: "V", moles: "n", temperature: "T" }}
            values={{ pressure: "1", volume: "?", moles: "1", temperature: "273.15" }}
            caption={t("behindTheTool.variablesSection.caption")}
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
