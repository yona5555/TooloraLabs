import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import EquipmentSection, { type EquipmentItem } from "@/components/tool-ui/EquipmentSection";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import WeatherLiveTempGauge from "./WeatherLiveTempGauge";
import WeatherDisasters, { type DisasterItem } from "./WeatherDisasters";

export default async function WeatherEducation() {
  const t = await getTranslations("tools.weather-forecast.education");
  const tAboveFold = await getTranslations("tools.weather-forecast.aboveFold");
  const tForecast = await getTranslations("tools.weather-forecast.forecast");

  const faqItems = t.raw("faq.items") as FAQItem[];
  const equipmentItems = t.raw("behindTheTool.equipment.items") as EquipmentItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];
  const disasterItems = t.raw("disasters.items") as DisasterItem[];

  return (
    <EncyclopediaPaper>
      <WeatherLiveTempGauge />

      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
      </InfoSection>

      <InfoSection title={t("models.title")}>
        <p>{t("models.paragraph1")}</p>
        <p>{t("models.paragraph2")}</p>
        <p>{t("models.paragraph3")}</p>
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection id="disasters" title={t("disasters.title")}>
        <WeatherDisasters intro={t("disasters.intro")} items={disasterItems} />
      </InfoSection>

      <InfoSection id="faq" title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
      </InfoSection>

      <InfoSection id="behind-the-tool" title={t("behindTheTool.title")}>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.history.title")}</h3>
          <p className="mt-2">{t("behindTheTool.history.paragraph")}</p>
        </div>
        <EquipmentSection
          title={t("behindTheTool.equipment.title")}
          intro={t("behindTheTool.equipment.intro")}
          items={equipmentItems}
        />
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

      <InfoSection id="notices" title={t("notices.title")}>
        <ul className="list-disc space-y-3 ps-5 text-sm leading-6 opacity-80">
          <li>{tAboveFold("disclaimer")}</li>
          <li>{tForecast("accuracyNote")}</li>
          <li>{t("intro.disclaimer")}</li>
          <li>{t("disasters.disclaimer")}</li>
        </ul>
      </InfoSection>
    </EncyclopediaPaper>
  );
}
