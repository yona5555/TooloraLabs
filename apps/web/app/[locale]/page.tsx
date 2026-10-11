import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/hero/Hero";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main data-home-page>
      <Hero />
    </main>
  );
}
