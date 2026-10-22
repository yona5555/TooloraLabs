import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/house-affordability-calculator";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "house-affordability-calculator");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="house-affordability-calculator" Entry={ToolEntry} />;
}
