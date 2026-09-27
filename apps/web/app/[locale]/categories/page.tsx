import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import HeroCategories from "@/components/hero/HeroCategories";
import BackButton from "@/components/tool-ui/BackButton";

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

  const t = await getTranslations({ locale, namespace: "categoriesSection" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return (
    <main className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-center gap-3">
        <BackButton href="/" label={tCommon("backToHome")} size={22} className="h-12 w-12" />
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 lg:text-4xl dark:text-zinc-50">{t("heading")}</h1>
      </div>
      <div className="mt-10">
        <HeroCategories />
      </div>
    </main>
  );
}
