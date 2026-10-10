import { getTranslations } from "next-intl/server";
import { BookOpen, Calculator, GraduationCap } from "lucide-react";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import NeumorphicIconBadge from "@/components/tool-ui/NeumorphicIconBadge";

type UseCaseItem = { title: string; description: string };
type Reference = { citation: string; note: string; url: string };

export default async function MTEducation() {
  const t = await getTranslations("tools.multiplication-table-generator.education");

  const useCaseItems = t.raw("useCases.items") as UseCaseItem[];
  const useCaseIcons = [GraduationCap, BookOpen, Calculator];
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

      <InfoSection title={t("useCases.title")}>
        <p>{t("useCases.intro")}</p>
        <div className="space-y-4">
          {useCaseItems.map((item, i) => (
            <div key={item.title} className="flex items-start gap-3">
              <NeumorphicIconBadge icon={useCaseIcons[i] ?? GraduationCap} className="mt-0.5" />
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </InfoSection>

      <InfoSection id="faq" title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection id="behind-the-tool" title={t("behindTheTool.title")}>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.history.title")}</h3>
          <p className="mt-2">{t("behindTheTool.history.paragraph")}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.pedagogy.title")}</h3>
          <p className="mt-2">{t("behindTheTool.pedagogy.paragraph")}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.method.title")}</h3>
          <p className="mt-2">{t("behindTheTool.method.paragraph")}</p>
        </div>
        <AcademicPathSection title={t("behindTheTool.academicPath.title")} intro={t("behindTheTool.academicPath.intro")} universities={universities} />
      </InfoSection>

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
