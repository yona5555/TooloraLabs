import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/ideal-gas-law-calculator";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "ideal-gas-law-calculator");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="ideal-gas-law-calculator" Entry={ToolEntry} />;
}
