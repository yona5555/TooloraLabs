import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import DocsLayout from "@/components/docs/DocsLayout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docsNav" });
  return { title: `${t("overview")} | Docs | TooloraLabs` };
}

export default async function DocsIndexPage() {
  const t = await getTranslations("docsNav");

  return (
    <DocsLayout toc={null}>
      <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{t("overview")}</h1>
      <p className="mb-6 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">{t("indexIntro")}</p>
      <Link
        href="/docs/compound-interest-calculator"
        className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        {t("indexCta")}
      </Link>
    </DocsLayout>
  );
}
