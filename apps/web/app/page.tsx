import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/hero/Hero";
import Categories from "@/components/categories/Categories";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Categories />
    </main>
  );
}
