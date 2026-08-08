import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";

export default async function CryptoEducation() {
  const t = await getTranslations("tools.crypto-converter.education");

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
        <p className="rounded-sm border border-current/20 px-4 py-3 text-sm">{t("intro.disclaimer")}</p>
      </InfoSection>
    </EncyclopediaPaper>
  );
}
