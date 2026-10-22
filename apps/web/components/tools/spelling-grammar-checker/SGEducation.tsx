import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import { SGArticleCard, SGDensityCard, SGLettersCard, SGRulesCard, SGScanCard, SGSlipsCard, SGTypesCard } from "./SGCards";
import { SGRibbonCard } from "./SGCard3D";

type UseCaseItem = { title: string; description: string };

export default async function SGEducation() {
  const t = await getTranslations("tools.spelling-grammar-checker.education");

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
        <SGRulesCard side="visual-left" />
        <SGArticleCard side="table-left" />
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {t("intro.limitation")}
        </p>
        <SGDensityCard side="visual-left" />
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection title={t("useCases.title")}>
        <p>{t("useCases.intro")}</p>
        <SGTypesCard side="table-left" />
        <div className="space-y-4">
          {useCaseItems.map((item) => (
            <div key={item.title}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1">{item.description}</p>
            </div>
          ))}
        </div>
        <SGRibbonCard side="visual-left" />
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection id="faq" title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
      </InfoSection>

      <SGScanCard side="table-left" />

      <InfoSection id="behind-the-tool" title={t("behindTheTool.title")}>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.history.title")}</h3>
          <p className="mt-2">{t("behindTheTool.history.paragraph")}</p>
        </div>
        <SGLettersCard side="visual-left" />
        <div>
          <h3 className="font-semibold">{t("behindTheTool.howItWorks.title")}</h3>
          <p className="mt-2">{t("behindTheTool.howItWorks.paragraph")}</p>
        </div>
        <SGSlipsCard side="table-left" />
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
      </div>
    </EncyclopediaPaper>
  );
}
