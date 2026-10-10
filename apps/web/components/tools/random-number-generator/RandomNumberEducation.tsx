import { getTranslations } from "next-intl/server";
import { BarChart3, Shuffle, Scale } from "lucide-react";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import NeumorphicIconBadge from "@/components/tool-ui/NeumorphicIconBadge";

type ApplicationItem = { title: string; description: string };
type Reference = { citation: string; note: string; url: string };

export default async function RandomNumberEducation() {
  const t = await getTranslations("tools.random-number-generator.education");

  const applicationItems = t.raw("applications.items") as ApplicationItem[];
  const icons = [BarChart3, Shuffle, Scale];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];
  const references = t.raw("references.items") as Reference[];
  const notices = t.raw("notices.items") as string[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
      </InfoSection>

      <InfoSection title={t("applications.title")}>
        <p>{t("applications.intro")}</p>
        <div className="space-y-4">
          {applicationItems.map((item, i) => (
            <div key={item.title} className="flex items-start gap-3">
              <NeumorphicIconBadge icon={icons[i] ?? BarChart3} className="mt-0.5" />
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1">{item.description}</p>
              </div>
            </div>
          ))}
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
          <h3 className="font-semibold">{t("behindTheTool.howItWorks.title")}</h3>
          <p className="mt-2">{t("behindTheTool.howItWorks.paragraph")}</p>
        </div>
        <AcademicPathSection
          title={t("behindTheTool.academicPath.title")}
          intro={t("behindTheTool.academicPath.intro")}
          universities={universities}
        />
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection title={t("references.title")}>
        <ol className="space-y-5">
          {references.map((ref) => (
            <li key={ref.url}>
              <p>{ref.citation}</p>
              <p className="text-sm opacity-70">{ref.note}</p>
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex rounded-sm border border-current/40 px-5 py-2.5 text-sm font-semibold no-underline transition hover:bg-current/5"
              >
                {t("references.readOriginal")}
              </a>
            </li>
          ))}
        </ol>
      </InfoSection>

      <InfoSection id="notices" title={t("notices.title")}>
        <ul className="list-disc space-y-3 ps-5 text-sm leading-6 opacity-80">
          {notices.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </InfoSection>
    </EncyclopediaPaper>
  );
}
