import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/debt-to-income-calculator";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "debt-to-income-calculator");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="debt-to-income-calculator" Entry={ToolEntry} />;
}
