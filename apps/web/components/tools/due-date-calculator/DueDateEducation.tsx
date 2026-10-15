import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import {
  DueBirthOddsCard,
  DueCalendarCard,
  DueCountdownCard,
  DueCycleCard,
  DueErrorTrioCard,
  DueMethodsCard,
  DueTermWindowCard,
  DueTimelineCard,
} from "./DueDateCards";

type ExampleRow = { calculation: string; result: string };
type MethodItem = { title: string; description: string };

export default async function DueDateEducation() {
  const t = await getTranslations("tools.due-date-calculator.education");
  const tv = await getTranslations("tools.due-date-calculator.visuals.notices");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const methodItems = t.raw("methods.items") as MethodItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      {/* The eight live indicators sit where the old drawings were; sides zigzag down the page. */}
      <div className="space-y-6" style={{ fontFamily: "var(--glass-font)" }}>
        <DueTimelineCard side="visual-left" />
        <DueCountdownCard side="table-left" />
      </div>


      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
        <div className="space-y-6" style={{ fontFamily: "var(--glass-font)" }}>
          <DueTermWindowCard side="visual-left" />
          <DueBirthOddsCard side="table-left" />
          <DueCalendarCard side="visual-left" />
        </div>
      </InfoSection>

      <InfoSection title={t("methods.title")}>
        <p>{t("methods.intro")}</p>
        <div className="space-y-4">
          {methodItems.map((item) => (
            <div key={item.title}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="space-y-6" style={{ fontFamily: "var(--glass-font)" }}>
          <DueCycleCard side="table-left" />
          <DueMethodsCard side="visual-left" />
          <DueErrorTrioCard side="table-left" />
        </div>
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
                  <td className="px-3 py-2.5 font-semibold">{row.result}</td>
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

      <InfoSection id="notices" title={tv("title")}>
        <ul className="list-disc space-y-3 ps-5 text-sm leading-6 opacity-80">
          <li>{tv("estimate")}</li>
          <li>{tv("assumptions")}</li>
        </ul>
      </InfoSection>
    </EncyclopediaPaper>
  );
}
