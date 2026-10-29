import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/hero/Hero";
import { localeAlternates } from "@/lib/seo";
import { shareMetadata } from "@/lib/share-image/meta";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: localeAlternates(locale, ""),
    ...(await shareMetadata(locale, "")),
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
