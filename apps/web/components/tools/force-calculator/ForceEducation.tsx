import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import ForceBlockDiagram from "./ForceBlockDiagram";
import ForceFreeBodyDiagram from "./ForceFreeBodyDiagram";
import GravitationDiagram from "./GravitationDiagram";
import ForceInverseSquareDiagram from "./ForceInverseSquareDiagram";
import ForceVariablesDiagram from "./ForceVariablesDiagram";

type ExampleRow = { calculation: string; result: string };

export default async function ForceEducation() {
  const t = await getTranslations("tools.force-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <ForceBlockDiagram
          force={6}
          acceleration={3}
          forceLabel="F=6 N"
          accelerationLabel="a=3 m/s²"
          caption={t("intro.diagram.caption")}
        />
        <p>{t("intro.paragraph2")}</p>
        <ForceFreeBodyDiagram appliedLabel={t("intro.freeBody.applied")} netLabel={t("intro.freeBody.net")} caption={t("intro.freeBody.caption")} />
        <p>{t("intro.paragraph3")}</p>
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
          <h3 className="font-semibold">{t("behindTheTool.gravitationSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.gravitationSection.paragraph")}</p>
          <GravitationDiagram mass1={5.972e24} mass2={1} label1="m₁" label2="m₂" caption={t("behindTheTool.gravitationSection.caption")} />
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.inverseSquareSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.inverseSquareSection.paragraph")}</p>
          <ForceInverseSquareDiagram
            xLabel={t("behindTheTool.inverseSquareSection.xLabel")}
            yLabel={t("behindTheTool.inverseSquareSection.yLabel")}
            caption={t("behindTheTool.inverseSquareSection.caption")}
          />
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.variablesSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.variablesSection.paragraph")}</p>
          <ForceVariablesDiagram
            solved="acceleration"
            order={["force", "mass", "acceleration"]}
            labels={{ force: "F", mass: "m", acceleration: "a" }}
            values={{ force: "10", mass: "2", acceleration: "?" }}
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
