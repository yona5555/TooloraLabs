import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/random-number-generator";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "random-number-generator");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="random-number-generator" Entry={ToolEntry} />;
}
