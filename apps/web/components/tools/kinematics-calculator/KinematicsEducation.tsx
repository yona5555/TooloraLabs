import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import MotionDiagram from "./MotionDiagram";
import KinematicsPositionTimeDiagram from "./KinematicsPositionTimeDiagram";
import KinematicsVelocityTimeDiagram from "./KinematicsVelocityTimeDiagram";
import KinematicsVariablesDiagram from "./KinematicsVariablesDiagram";
import KinematicsReferenceAccelerationsDiagram from "./KinematicsReferenceAccelerationsDiagram";

type ExampleRow = { calculation: string; result: string };

export default async function KinematicsEducation() {
  const t = await getTranslations("tools.kinematics-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <MotionDiagram v0={0} v={10} startLabel={t("intro.diagram.startLabel")} endLabel={t("intro.diagram.endLabel")} caption={t("intro.diagram.caption")} />
        <p>{t("intro.paragraph2")}</p>
        <KinematicsPositionTimeDiagram xLabel={t("intro.positionTime.xLabel")} yLabel={t("intro.positionTime.yLabel")} caption={t("intro.positionTime.caption")} />
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
          <h3 className="font-semibold">{t("behindTheTool.velocityTimeSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.velocityTimeSection.paragraph")}</p>
          <KinematicsVelocityTimeDiagram
            v0={0}
            v={10}
            xLabel={t("behindTheTool.velocityTimeSection.xLabel")}
            yLabel={t("behindTheTool.velocityTimeSection.yLabel")}
            areaLabel="Δx = 25 m"
            caption={t("behindTheTool.velocityTimeSection.caption")}
          />
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.variablesSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.variablesSection.paragraph")}</p>
          <KinematicsVariablesDiagram
            solved="a"
            order={["v0", "v", "a", "t", "dx"]}
            labels={{ v0: "v₀", v: "v", a: "a", t: "t", dx: "Δx" }}
            values={{ v0: "0", v: "10", a: "?", t: "5", dx: "25" }}
            caption={t("behindTheTool.variablesSection.caption")}
          />
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.referenceSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.referenceSection.paragraph")}</p>
          <KinematicsReferenceAccelerationsDiagram
            labels={[
              t("behindTheTool.referenceSection.r1"),
              t("behindTheTool.referenceSection.r2"),
              t("behindTheTool.referenceSection.r3"),
              t("behindTheTool.referenceSection.r4"),
              t("behindTheTool.referenceSection.r5"),
            ]}
            caption={t("behindTheTool.referenceSection.caption")}
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
