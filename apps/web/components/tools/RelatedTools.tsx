import { getTranslations } from "next-intl/server";
import { tools } from "@/data/tools";
import DecoratedToolCard from "@/components/tool-ui/DecoratedToolCard";
import AdSpace from "@/components/tool-ui/AdSpace";

type Props = {
  locale: string;
  category: string;
  currentSlug: string;
};

export default async function RelatedTools({
  locale,
  category,
  currentSlug,
}: Props) {
  const related = tools
    .filter((tool) => tool.category === category && tool.slug !== currentSlug)
    .slice(0, 3);

  const t = await getTranslations({ locale, namespace: "toolPage" });
  const tTools = await getTranslations({ locale, namespace: "tools" });
  const tToolsPage = await getTranslations({ locale, namespace: "toolsPage" });

  return (
    <section className="mx-auto max-w-5xl px-6 pb-20">
      <AdSpace variant="leaderboard" className={related.length > 0 ? "mb-10 lg:mb-12" : ""} />

      {related.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {t("relatedTools")}
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((tool) => (
              <DecoratedToolCard
                key={tool.slug}
                tool={tool}
                titleText={tTools(`${tool.slug}.title`)}
                descriptionText={tTools(`${tool.slug}.description`)}
                featuredLabel={tToolsPage("featuredBadge")}
                size="small"
                showTags={false}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
