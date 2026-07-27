import Link from "next/link";
import { tools } from "@/data/tools";

export default function FeaturedTools() {
  const featuredTools = tools.filter((tool) => tool.featured);

  return (
    <section
      id="popular-tools"
      className="mx-auto max-w-7xl px-6 py-24"
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
          Featured Tools
        </span>

        <h2 className="mt-6 text-5xl font-extrabold tracking-tight text-zinc-900">
          Most Popular Tools
        </h2>

        <p className="mt-5 text-lg leading-8 text-zinc-600">
          Quickly access the tools people use every day.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {featuredTools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              🛠️
            </div>

            <h3 className="text-lg font-bold text-zinc-900">
              {tool.title}
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
