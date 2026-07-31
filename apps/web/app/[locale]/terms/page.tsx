import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

type PageProps = {
  params: Promise<{ locale: string }>;
};

type Section = { heading: string; body: string };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.terms" });
  return { title: `${t("title")} | TooloraLabs` };
}

export default async function TermsOfUsePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.terms" });
  const sections = t.raw("sections") as Section[];

  return (
    <LegalPageLayout title={t("title")} intro={t("intro")} sections={sections} />
  );
}
