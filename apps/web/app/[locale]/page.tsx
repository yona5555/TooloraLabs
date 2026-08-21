import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/hero/Hero";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950">
      <Hero />
    </main>
  );
}
