import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/energy-work-power-calculator";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "energy-work-power-calculator");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="energy-work-power-calculator" Entry={ToolEntry} />;
}
