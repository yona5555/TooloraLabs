import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import { RomanAdditionCard, RomanClockCard, RomanLengthCard, RomanSubtractiveCard, RomanTallyCard, RomanVinculumCard, RomanWaterfallCard, RomanYearsCard } from "./RomanCards";

type ExampleRow = { arabic: string; roman: string };
type UseCaseItem = { title: string; description: string };

export default async function RomanEducation() {
  const t = await getTranslations("tools.roman-numeral-converter.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const useCaseItems = t.raw("useCases.items") as UseCaseItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      {/* The paper sets a serif face; this page is Inter throughout (same spacing as the paper's own stack). */}
      <div className="space-y-12" style={{ fontFamily: "var(--glass-font)" }}>
      {/* Every indicator sits right after the paragraph it illustrates; sides zigzag down the page. */}
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <RomanWaterfallCard side="visual-left" />
        <p>{t("intro.paragraph2")}</p>
        <RomanSubtractiveCard side="table-left" />
      </InfoSection>

      <InfoSection title={t("useCases.title")}>
        <p>{t("useCases.intro")}</p>
        <div className="space-y-4">
          {useCaseItems.map((item) => (
            <div key={item.title}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1">{item.description}</p>
            </div>
          ))}
        </div>
        <RomanClockCard side="visual-left" />
      </InfoSection>

      <InfoSection title={t("examples.title")}>
        <p>{t("examples.intro")}</p>
        <RomanLengthCard side="table-left" />
        <div dir="ltr" className="overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-current/30 text-start">
                <th className="px-3 py-2 text-start font-semibold">{t("examples.columnArabic")}</th>
                <th className="px-3 py-2 text-start font-semibold">{t("examples.columnRoman")}</th>
              </tr>
            </thead>
            <tbody>
              {exampleRows.map((row) => (
                <tr key={row.arabic} className="border-b border-current/10">
                  <td className="px-3 py-2.5">{row.arabic}</td>
                  <td className="px-3 py-2.5 font-semibold tracking-wide">{row.roman}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <RomanYearsCard side="visual-left" />
      </InfoSection>

      <InfoSection id="faq" title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
      </InfoSection>

      <RomanVinculumCard side="table-left" />

      <InfoSection id="behind-the-tool" title={t("behindTheTool.title")}>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.history.title")}</h3>
          <p className="mt-2">{t("behindTheTool.history.paragraph")}</p>
        </div>
        <RomanTallyCard side="visual-left" />
        <div>
          <h3 className="font-semibold">{t("behindTheTool.modernUse.title")}</h3>
          <p className="mt-2">{t("behindTheTool.modernUse.paragraph")}</p>
        </div>
        <RomanAdditionCard side="table-left" />
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
