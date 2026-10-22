import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/mortgage-calculator";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "mortgage-calculator");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="mortgage-calculator" Entry={ToolEntry} />;
}
