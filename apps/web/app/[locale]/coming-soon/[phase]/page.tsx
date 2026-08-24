import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { comingSoonPhaseIds, comingSoonPhases, type ComingSoonPhaseId } from "@/data/comingSoon";
import { getComingSoonIcon } from "@/lib/coming-soon-icons";

type ComingSoonPhasePageProps = {
  params: Promise<{
    locale: string;
    phase: string;
  }>;
};

export function generateStaticParams() {
  return comingSoonPhaseIds.map((phase) => ({ phase }));
}

function isPhaseId(value: string): value is ComingSoonPhaseId {
  return (comingSoonPhaseIds as string[]).includes(value);
}

export async function generateMetadata({ params }: ComingSoonPhasePageProps): Promise<Metadata> {
  const { locale, phase } = await params;
  if (!isPhaseId(phase)) {
    const t = await getTranslations({ locale, namespace: "comingSoonPage" });
    return { title: `${t("notFoundTitle")} | TooloraLabs` };
  }
  const t = await getTranslations({ locale, namespace: "comingSoonPage" });
  return {
    title: `${t(`phase.${phase}.title`)} | TooloraLabs`,
    description: t(`phase.${phase}.description`),
  };
}

export default async function ComingSoonPhasePage({ params }: ComingSoonPhasePageProps) {
  const { locale, phase } = await params;
  if (!isPhaseId(phase)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "comingSoonPage" });
  const tTools = await getTranslations({ locale, namespace: "comingSoonTools" });

  const phaseTools = comingSoonPhases[phase];

  return (
    <main className="mx-auto max-w-7xl px-6 py-24">
      <Link
        href="/coming-soon"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
      >
        <ArrowLeft size={16} className="rtl:rotate-180" />
        {t("backToComingSoon")}
      </Link>

      <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        <Clock size={16} />
        {t(`phase.${phase}.estimatedDate`)}
      </span>

      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
        {t(`phase.${phase}.title`)}
      </h1>

      <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
        {t(`phase.${phase}.description`)}
      </p>

      <p className="mt-4 font-medium text-zinc-500 dark:text-zinc-400">
        {t("toolCount", { count: phaseTools.length })}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {phaseTools.map((tool) => {
          const Icon = getComingSoonIcon(tool.icon);
          return (
            <div
              key={tool.id}
              className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
              >
                <span className="-rotate-[22deg] whitespace-nowrap text-2xl font-extrabold uppercase tracking-widest text-blue-500/15 dark:text-blue-300/15">
                  {t("watermark")} &nbsp; {t("watermark")} &nbsp; {t("watermark")}
                </span>
              </div>

              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Icon size={22} strokeWidth={2} />
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{tTools(tool.id)}</h3>

                <span className="mt-3 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  {t("watermark")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
