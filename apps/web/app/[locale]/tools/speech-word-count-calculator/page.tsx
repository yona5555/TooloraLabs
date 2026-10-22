import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/speech-word-count-calculator";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "speech-word-count-calculator");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="speech-word-count-calculator" Entry={ToolEntry} />;
}
