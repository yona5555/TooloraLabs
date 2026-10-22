import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/speech-to-text";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "speech-to-text");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="speech-to-text" Entry={ToolEntry} />;
}
