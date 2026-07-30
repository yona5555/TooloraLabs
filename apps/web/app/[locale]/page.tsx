import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/hero/Hero";
import Categories from "@/components/categories/Categories";
import FeaturedTools from "@/components/tools/FeaturedTools";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <Navbar />

      <Hero />

      <FeaturedTools />

      <Categories />
    </main>
  );
}
