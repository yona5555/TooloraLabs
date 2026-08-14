import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getLocaleDir } from "@/lib/locale-meta";
import { getLocaleFontClassName } from "@/lib/locale-fonts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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

  const dir = getLocaleDir(locale);

  return (
    <NextIntlClientProvider locale={locale}>
      <div
        lang={locale}
        dir={dir}
        className={getLocaleFontClassName(locale)}
      >
        <Navbar />
        {children}
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
