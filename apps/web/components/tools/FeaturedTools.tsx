import { useTranslations } from "next-intl";
import { tools } from "@/data/tools";
import DecoratedToolCard from "@/components/tool-ui/DecoratedToolCard";

// Every card in this section is already `tool.featured` by definition (filtered below), and the
// section itself is titled/badged "Featured" — repeating a per-card "Featured" badge here would
// just be redundant, so this is the one tool-card location that deliberately omits `featuredLabel`.
export default function FeaturedTools() {
  const t = useTranslations("featuredTools");
  const tTools = useTranslations("tools");
  const featuredTools = tools.filter((tool) => tool.featured);

  return (
    <section
      id="popular-tools"
      className="mx-auto max-w-7xl px-6 py-24"
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {t("badge")}
        </span>

        <h2 className="mt-6 text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t("heading")}
        </h2>

        <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {featuredTools.map((tool) => (
          <DecoratedToolCard
            key={tool.slug}
            tool={tool}
            titleText={tTools(`${tool.slug}.title`)}
            descriptionText={tTools(`${tool.slug}.description`)}
            maxTags={2}
          />
        ))}
      </div>
    </section>
  );
}
