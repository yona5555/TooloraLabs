import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";

// Below-the-fold education diagrams: server-rendered (dynamic() keeps ssr:true, its default) so the
// content is still in the initial HTML, but their client hydration code splits into its own chunk
// instead of bloating the above-the-fold bundle every visitor pays for.
const MolCurveCard = dynamic(() => import("./MolarityCards2D").then((m) => m.MolCurveCard));
const MolDonutCard = dynamic(() => import("./MolarityCards2D").then((m) => m.MolDonutCard));
const MolFlowCard = dynamic(() => import("./MolarityCards2D").then((m) => m.MolFlowCard));
const MolRulerCard = dynamic(() => import("./MolarityCards2D").then((m) => m.MolRulerCard));
const MolSerialCard = dynamic(() => import("./MolarityCards2D").then((m) => m.MolSerialCard));
const MolCylindersCard = dynamic(() => import("./MolarityCards3D").then((m) => m.MolCylindersCard));
const MolDropletCard = dynamic(() => import("./MolarityCards3D").then((m) => m.MolDropletCard));
const MolHeapsCard = dynamic(() => import("./MolarityCards3D").then((m) => m.MolHeapsCard));

type ExampleRow = { calculation: string; result: string };

export default async function MolarityEducation() {
  const t = await getTranslations("tools.molarity-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      {/* The paper sets a serif face; this page is Inter throughout (same spacing as the paper's own stack). */}
      <div className="space-y-12" style={{ fontFamily: "var(--glass-font)" }}>
      {/* Every indicator sits right after the paragraph it illustrates; sides zigzag down the page. */}
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <MolFlowCard side="visual-left" />
        <p>{t("intro.paragraph2")}</p>
        <MolCylindersCard side="table-left" />
        <p>{t("intro.paragraph3")}</p>
        <MolCurveCard side="visual-left" />
      </InfoSection>

      <InfoSection title={t("examples.title")}>
        <p>{t("examples.intro")}</p>
        <MolDropletCard side="table-left" />
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
                  <td className="px-3 py-2.5 font-semibold tabular-nums">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <MolSerialCard side="visual-left" />
      </InfoSection>

      <InfoSection id="faq" title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
      </InfoSection>

      <MolRulerCard side="table-left" />

      <InfoSection id="behind-the-tool" title={t("behindTheTool.title")}>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.history.title")}</h3>
          <p className="mt-2">{t("behindTheTool.history.paragraph")}</p>
        </div>
        <MolHeapsCard side="visual-left" />
        <div>
          <h3 className="font-semibold">{t("behindTheTool.modernDevelopments.title")}</h3>
          <p className="mt-2">{t("behindTheTool.modernDevelopments.paragraph")}</p>
        </div>
        <MolDonutCard side="table-left" />
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
      </div>
    </EncyclopediaPaper>
  );
}
