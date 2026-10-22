import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/roman-numeral-converter";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "roman-numeral-converter");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="roman-numeral-converter" Entry={ToolEntry} />;
}
