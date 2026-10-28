import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Hero from "@/components/hero/Hero";
import { localeAlternates } from "@/lib/seo";
import { shareImageMetadata } from "@/lib/share-image/meta";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale } = await params;
  const { images, twitter } = shareImageMetadata(locale, "home", (await getTranslations({ locale, namespace: "site" }))("description"));
  return {
    alternates: localeAlternates(locale, ""),
    openGraph: { images },
    twitter,
  };
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main data-home-page>
      <Hero />
    </main>
  );
}
