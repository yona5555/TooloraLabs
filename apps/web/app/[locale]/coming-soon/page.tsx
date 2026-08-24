import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { comingSoonPhaseIds, comingSoonPhases } from "@/data/comingSoon";

type ComingSoonPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ComingSoonPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "comingSoonPage" });
  return {
    title: `${t("heading")} | TooloraLabs`,
    description: t("subtitle"),
  };
}

export default async function ComingSoonPage({ params }: ComingSoonPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "comingSoonPage" });

  return (
    <main className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <Clock size={16} />
          {t("badge")}
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t("heading")}
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">{t("subtitle")}</p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {comingSoonPhaseIds.map((phaseId) => {
          const toolCount = comingSoonPhases[phaseId].length;
          return (
            <Link
              key={phaseId}
              href={`/coming-soon/${phaseId}`}
              className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none dark:hover:border-blue-500/40"
            >
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Clock size={12} />
                {t(`phase.${phaseId}.estimatedDate`)}
              </span>

              <h2 className="mt-5 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {t(`phase.${phaseId}.title`)}
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {t(`phase.${phaseId}.description`)}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5 dark:border-zinc-800">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  {t("toolCount", { count: toolCount })}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 transition group-hover:gap-2 dark:text-blue-400">
                  {t("viewPhase")}
                  <ArrowRight size={16} className="rtl:rotate-180" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
