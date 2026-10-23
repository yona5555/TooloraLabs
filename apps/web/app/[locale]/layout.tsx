import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getLocaleDir } from "@/lib/locale-meta";
import { getLocaleFontClassName } from "@/lib/locale-fonts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CARD_PREPAINT_SCRIPT } from "@/components/tool-ui/cardPrepaint";
import CardFirstOpener from "@/components/tool-ui/CardFirstOpener";
import HtmlDocument from "@/components/layout/HtmlDocument";
import { jsonLdHtml, organizationJsonLd } from "@/lib/seo";
import { getClientMessages } from "@/lib/client-messages";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <HtmlDocument lang={locale} dir={getLocaleDir(locale)}>
      <NextIntlClientProvider locale={locale} messages={await getClientMessages(locale)}>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(organizationJsonLd)} />
        <div className={getLocaleFontClassName(locale)}>
          <Navbar />
          {children}
          <Footer />
        </div>
        <CardFirstOpener />
        <script dangerouslySetInnerHTML={{ __html: CARD_PREPAINT_SCRIPT }} />
      </NextIntlClientProvider>
    </HtmlDocument>
  );
}
