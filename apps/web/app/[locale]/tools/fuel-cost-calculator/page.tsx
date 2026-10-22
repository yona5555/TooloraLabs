import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/fuel-cost-calculator";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "fuel-cost-calculator");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="fuel-cost-calculator" Entry={ToolEntry} />;
}
