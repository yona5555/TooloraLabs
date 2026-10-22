import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/text-to-speech";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "text-to-speech");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="text-to-speech" Entry={ToolEntry} />;
}
