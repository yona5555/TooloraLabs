import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EmbedCodeGenerator from "@/components/embed/EmbedCodeGenerator";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "embedTools.docsPage" });
  return {
    title: `${t("title")} | TooloraLabs`,
    description: t("description"),
  };
}

export default async function EmbedToolsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "embedTools.docsPage" });
  const steps = t.raw("steps") as string[];
  const faqItems = t.raw("faq") as { question: string; answer: string }[];

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 lg:text-4xl dark:text-zinc-50">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">{t("intro")}</p>

      <div className="mt-10">
        <SectionCard title={t("howItWorksTitle")}>
          <ol className="list-inside list-decimal space-y-2 text-zinc-700 dark:text-zinc-300">
            {steps.map((step, i) => (
              <li key={i} className="leading-7">
                {step}
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>

      <div className="mt-8">
        <SectionCard title={t("generator.title")}>
          <EmbedCodeGenerator />
        </SectionCard>
      </div>

      <div className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t("faqTitle")}</h2>
        {faqItems.map((item) => (
          <div key={item.question}>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.question}</h3>
            <p className="mt-1.5 leading-7 text-zinc-600 dark:text-zinc-300">{item.answer}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
