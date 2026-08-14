import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

type PageProps = {
  params: Promise<{ locale: string }>;
};

type CompareRow = {
  slug: string;
  name: string;
  bestFor: string;
  question: string;
  keyInputs: string;
  output: string;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compareFinancialCalculators" });
  return {
    title: `${t("title")} | TooloraLabs`,
    description: t("description"),
  };
}

export default async function CompareFinancialCalculatorsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compareFinancialCalculators" });
  const rows = t.raw("rows") as CompareRow[];
  const guidance = t.raw("guidance") as { title: string; body: string }[];

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 lg:text-4xl dark:text-zinc-50">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">{t("intro")}</p>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[720px] border-collapse text-start text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <th className="px-4 py-3 text-start font-semibold">{t("columnTool")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("columnBestFor")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("columnQuestion")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("columnInputs")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("columnOutput")}</th>
              <th className="px-4 py-3 text-start font-semibold"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.slug} className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800/60">
                <td className="px-4 py-4 font-semibold text-zinc-900 dark:text-zinc-100">{row.name}</td>
                <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">{row.bestFor}</td>
                <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">{row.question}</td>
                <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">{row.keyInputs}</td>
                <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">{row.output}</td>
                <td className="px-4 py-4">
                  <Link
                    href={`/tools/${row.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 no-underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {t("openTool")}
                    <ArrowRight size={14} className="rtl:rotate-180" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t("guidanceTitle")}</h2>
        {guidance.map((item) => (
          <div key={item.title} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
            <p className="mt-1.5 leading-7 text-zinc-600 dark:text-zinc-300">{item.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
