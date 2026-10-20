import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/world-time-converter";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "world-time-converter");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="world-time-converter" Entry={ToolEntry} />;
}
