import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import SwTeleprompter from "./SwTeleprompter";
import SwFormula from "./SwFormula";
import SwPaceCompare from "./SwPaceCompare";
import SwTimeSlot from "./SwTimeSlot";
import SwSentenceBreaths from "./SwSentenceBreaths";
import SwMinuteMarks from "./SwMinuteMarks";
import SwPauseBudget from "./SwPauseBudget";
import SwSpeakVsRead from "./SwSpeakVsRead";

type UseCaseItem = { title: string; description: string };

export default async function SWEducation() {
  const t = await getTranslations("tools.speech-word-count-calculator.education");

  const useCaseItems = t.raw("useCases.items") as UseCaseItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <div className="space-y-6">
          <SwTeleprompter />
          <SwFormula />
          <SwPaceCompare />
          <SwTimeSlot />
        </div>
        <p>{t("intro.paragraph2")}</p>
        <div className="space-y-6">
          <SwSpeakVsRead />
          <SwSentenceBreaths />
        </div>
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
        <div className="space-y-6">
          <SwMinuteMarks />
          <SwPauseBudget />
        </div>
      </InfoSection>

      <InfoSection id="faq" title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
      </InfoSection>

      <InfoSection id="behind-the-tool" title={t("behindTheTool.title")}>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.speakingVsReading.title")}</h3>
          <p className="mt-2">{t("behindTheTool.speakingVsReading.paragraph")}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.limitations.title")}</h3>
          <p className="mt-2">{t("behindTheTool.limitations.paragraph")}</p>
        </div>
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
    </EncyclopediaPaper>
  );
}
