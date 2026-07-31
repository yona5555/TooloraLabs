import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AgeCalculator from "@/components/tools/age-calculator/AgeCalculator";
import BMICalculator from "@/components/tools/bmi-calculator/BMICalculator";
import MortgageCalculator from "@/components/tools/mortgage-calculator/MortgageCalculator";
import PercentageCalculator from "@/components/tools/percentage-calculator/PercentageCalculator";
import TipCalculator from "@/components/tools/tip-calculator/TipCalculator";
import DiscountCalculator from "@/components/tools/discount-calculator/DiscountCalculator";
import SalesTaxCalculator from "@/components/tools/sales-tax-calculator/SalesTaxCalculator";
import ToolPageLayout from "@/components/tools/layout/ToolPageLayout";
import { tools } from "@/data/tools";

type ToolPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) {
    const t = await getTranslations({ locale, namespace: "toolPage" });
    return {
      title: `${t("notFoundTitle")} | TooloraLabs`,
    };
  }
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: `${t(`${slug}.title`)} | TooloraLabs`,
    description: t(`${slug}.description`),
  };
}

function ComingSoon({
  title,
  line1,
  line2,
}: {
  title: string;
  line1: string;
  line2: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <p className="mt-4 text-zinc-600 dark:text-zinc-300">{line1}</p>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">{line2}</p>
    </div>
  );
}

export default async function ToolPage({
  params,
}: ToolPageProps) {
  const { locale, slug } = await params;
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "tools" });
  const tp = await getTranslations({ locale, namespace: "toolPage" });
  const tc = await getTranslations({ locale, namespace: "categories" });

  const title = t(`${slug}.title`);
  const description = t(`${slug}.description`);

  let component = (
    <ComingSoon
      title={title}
      line1={tp("comingSoonLine1")}
      line2={tp("comingSoonLine2")}
    />
  );
  switch (slug) {
    case "age-calculator":
      component = <AgeCalculator />;
      break;
    case "bmi-calculator":
      component = <BMICalculator />;
      break;
    case "mortgage-calculator":
      component = <MortgageCalculator />;
      break;
    case "percentage-calculator":
      component = <PercentageCalculator />;
      break;
    case "tip-calculator":
      component = <TipCalculator />;
      break;
    case "discount-calculator":
      component = <DiscountCalculator />;
      break;
    case "sales-tax-calculator":
      component = <SalesTaxCalculator />;
      break;
  }

  return (
    <ToolPageLayout
      category={tc(`${tool.category}.title`)}
      categorySlug={tool.category}
      backLabel={tp("back", { category: tc(`${tool.category}.title`) })}
      title={title}
      description={description}
    >
      {component}
    </ToolPageLayout>
  );
}
