import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import PasswordLengthCurve from "./PasswordLengthCurve";
import PasswordPoolBar from "./PasswordPoolBar";
import PasswordEntropyGauge from "./PasswordEntropyGauge";
import PasswordCrackLadder from "./PasswordCrackLadder";
import PasswordClassDonut from "./PasswordClassDonut";
import PasswordPolicyRanking from "./PasswordPolicyRanking";
import PasswordEntropyFormula from "./PasswordEntropyFormula";
import PasswordCollisionTrio from "./PasswordCollisionTrio";
import PasswordKeyspaceEquivalence from "./PasswordKeyspaceEquivalence";

type ExampleRow = { scenario: string; result: string };

export default async function PasswordEducation() {
  const t = await getTranslations("tools.password-generator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <PasswordLengthCurve />
        <PasswordEntropyFormula />
        <p>{t("intro.paragraph2")}</p>
        <div className="space-y-6">
          <PasswordPoolBar />
          <PasswordEntropyGauge />
        </div>
        <PasswordCrackLadder />
      </InfoSection>

      <InfoSection title={t("examples.title")}>
        <p>{t("examples.intro")}</p>
        <div dir="ltr" className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-current/30 text-start">
                <th className="px-3 py-2 text-start font-semibold">{t("examples.columnScenario")}</th>
                <th className="px-3 py-2 text-start font-semibold">{t("examples.columnResult")}</th>
              </tr>
            </thead>
            <tbody>
              {exampleRows.map((row) => (
                <tr key={row.scenario} className="border-b border-current/10">
                  <td className="px-3 py-2.5">{row.scenario}</td>
                  <td className="px-3 py-2.5 font-mono font-semibold">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoSection>

      <InfoSection id="faq" title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
        <PasswordPolicyRanking />
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
        <div className="space-y-6">
          <PasswordClassDonut />
          <PasswordCollisionTrio />
          <PasswordKeyspaceEquivalence />
        </div>
        <AcademicPathSection title={t("behindTheTool.academicPath.title")} intro={t("behindTheTool.academicPath.intro")} universities={universities} />
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
