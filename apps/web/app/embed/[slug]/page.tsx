import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import BMICalculatorEmbed from "@/components/tools/bmi-calculator/BMICalculatorEmbed";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
  display: "swap",
});

// Tools available for third-party embedding. Add a slug here + a case below
// once a tool has a compact <...Embed /> component built for it.
const EMBEDDABLE_SLUGS = ["bmi-calculator"] as const;
type EmbeddableSlug = (typeof EMBEDDABLE_SLUGS)[number];

function isEmbeddable(slug: string): slug is EmbeddableSlug {
  return (EMBEDDABLE_SLUGS as readonly string[]).includes(slug);
}

function resolveLocale(raw: string | undefined): string {
  return raw && hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
}

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ locale?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { locale: rawLocale } = await searchParams;
  const locale = resolveLocale(rawLocale);

  if (!isEmbeddable(slug)) {
    return { title: "TooloraLabs" };
  }

  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t(`${slug}.title`),
    robots: { index: false, follow: false },
  };
}

export default async function EmbedPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { locale: rawLocale } = await searchParams;
  const locale = resolveLocale(rawLocale);

  if (!isEmbeddable(slug)) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tEmbed = await getTranslations({ locale, namespace: "embedTools" });
  const dir = locale === "ar" ? "rtl" : "ltr";

  const toolUrl = `${SITE_URL}/${locale}/tools/${slug}`;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div
        lang={locale}
        dir={dir}
        className={`bg-white p-3 dark:bg-zinc-950 ${locale === "ar" ? ibmPlexSansArabic.className : ""}`}
      >
        <p className="mb-3 text-center text-sm font-bold text-zinc-900 dark:text-zinc-50">
          {t(`${slug}.title`)}
        </p>

        {slug === "bmi-calculator" && <BMICalculatorEmbed />}

        <a
          href={toolUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-zinc-400 no-underline transition hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400"
        >
          {tEmbed("poweredBy")}
        </a>
      </div>
    </NextIntlClientProvider>
  );
}
