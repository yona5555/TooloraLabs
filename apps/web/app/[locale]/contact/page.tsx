import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.contact" });
  return { title: `${t("title")} | TooloraLabs` };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.contact" });
  const email = t("email");

  return (
    <LegalPageLayout title={t("title")} intro={t("intro")}>
      <a
        href={`mailto:${email}`}
        className="mt-8 inline-flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-4 transition hover:border-blue-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500/40"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <Mail size={20} />
        </span>
        <span>
          <span className="block text-sm text-zinc-500 dark:text-zinc-400">
            {t("emailLabel")}
          </span>
          <span className="block font-semibold text-zinc-900 dark:text-zinc-50">
            {email}
          </span>
        </span>
      </a>
    </LegalPageLayout>
  );
}
