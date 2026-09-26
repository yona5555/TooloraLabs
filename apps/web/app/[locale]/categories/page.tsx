import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import HeroCategories from "@/components/hero/HeroCategories";

type CategoriesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: CategoriesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categoriesSection" });
  return {
    title: `${t("heading")} | TooloraLabs`,
    description: t("subtitle"),
  };
}

export default async function CategoriesPage({
  params,
}: CategoriesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-7xl px-6 py-24">
      <HeroCategories />
    </main>
  );
}
