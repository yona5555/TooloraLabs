import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getLocaleDir } from "@/lib/locale-meta";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { localeFontPreload } from "@/lib/locale-font-preload";
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
    <HtmlDocument lang={locale} dir={getLocaleDir(locale)} fontPreload={localeFontPreload(locale)}>
      <NextIntlClientProvider locale={locale} messages={await getClientMessages(locale)}>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(organizationJsonLd)} />
        <div>
          <Navbar />
          {children}
          <Footer />
        </div>
      </NextIntlClientProvider>
    </HtmlDocument>
  );
}
