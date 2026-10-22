import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import {
  BarcodeCheckDigitCard,
  BarcodeChecksumCard,
  BarcodeGrowthCard,
  BarcodeParityCard,
  BarcodePatternsCard,
  BarcodeSizeCard,
  BarcodeTranspositionCard,
  BarcodeWidthCard,
} from "./BarcodeCards";

type ExampleRow = { scenario: string; result: string };

export default async function BarcodeEducation() {
  const t = await getTranslations("tools.barcode-generator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      {/* Inter throughout; every indicator sits right after the paragraph it illustrates, sides zigzag. */}
      <div className="space-y-12" style={{ fontFamily: "var(--glass-font)" }}>
        <InfoSection title={t("intro.title")}>
          <p>{t("intro.paragraph1")}</p>
          <BarcodeWidthCard side="visual-left" />
          <p>{t("intro.paragraph2")}</p>
          <BarcodeCheckDigitCard side="table-left" />
        </InfoSection>

        <AdSpace variant="leaderboard" />

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
                    <td className="break-all px-3 py-2.5 font-mono text-xs font-semibold">{row.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <BarcodeChecksumCard side="visual-left" />
          <BarcodePatternsCard side="table-left" />
        </InfoSection>

        <AdSpace variant="leaderboard" />

        <InfoSection id="faq" title={t("faq.title")}>
          <FAQAccordion items={faqItems} />
        </InfoSection>

        <BarcodeSizeCard side="visual-left" />

        <InfoSection id="behind-the-tool" title={t("behindTheTool.title")}>
          <div>
            <h3 className="font-semibold">{t("behindTheTool.history.title")}</h3>
            <p className="mt-2">{t("behindTheTool.history.paragraph")}</p>
          </div>
          <BarcodeParityCard side="table-left" />
          <div>
            <h3 className="font-semibold">{t("behindTheTool.modernDevelopments.title")}</h3>
            <p className="mt-2">{t("behindTheTool.modernDevelopments.paragraph")}</p>
          </div>
          <BarcodeGrowthCard side="visual-left" />
          <AcademicPathSection
            title={t("behindTheTool.academicPath.title")}
            intro={t("behindTheTool.academicPath.intro")}
            universities={universities}
          />
        </InfoSection>

        <AdSpace variant="leaderboard" />

        <BarcodeTranspositionCard side="table-left" />

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
