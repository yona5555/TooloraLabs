import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/batch-invoice-calculator";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "batch-invoice-calculator");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="batch-invoice-calculator" Entry={ToolEntry} />;
}
