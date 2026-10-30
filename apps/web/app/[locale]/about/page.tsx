import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { localeAlternates } from "@/lib/seo";
import { shareMetadata } from "@/lib/share-image/meta";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.about" });
  return {
    title: `${t("title")} | TooloraLabs`,
    alternates: localeAlternates(locale, "/about"),
    ...(await shareMetadata(locale, "/about")),
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.about" });
  const paragraphs = t.raw("paragraphs") as string[];

  return (
    <LegalPageLayout title={t("title")}>
      <div className="mt-6 space-y-5">
        {paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="text-lg leading-8 text-zinc-600 dark:text-zinc-300"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </LegalPageLayout>
  );
}
