import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  const { slug } = await params;
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) {
    return {
      title: "Tool Not Found | TooloraLabs",
    };
  }
  return {
    title: `${tool.title} | TooloraLabs`,
    description: tool.description,
  };
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
      <h2 className="text-2xl font-bold text-zinc-900">{title}</h2>
      <p className="mt-4 text-zinc-600">
        This tool is currently under development.
      </p>
      <p className="mt-2 text-zinc-500">
        It will be available in a future update of TooloraLabs.
      </p>
    </div>
  );
}

export default async function ToolPage({
  params,
}: ToolPageProps) {
  const { slug } = await params;
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) {
    notFound();
  }

  let component = <ComingSoon title={tool.title} />;
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
      category={tool.category}
      title={tool.title}
      description={tool.description}
    >
      {component}
    </ToolPageLayout>
  );
}
