import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/target-heart-rate-calculator";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "target-heart-rate-calculator");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="target-heart-rate-calculator" Entry={ToolEntry} />;
}
