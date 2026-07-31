import TrustBar from "@/components/layout/TrustBar";
import Hero from "@/components/hero/Hero";
import Categories from "@/components/categories/Categories";
import FeaturedTools from "@/components/tools/FeaturedTools";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950">
      <Hero />

      <FeaturedTools />

      <Categories />

      <TrustBar />
    </main>
  );
}
