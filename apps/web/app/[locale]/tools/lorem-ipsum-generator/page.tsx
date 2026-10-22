import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/lorem-ipsum-generator";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "lorem-ipsum-generator");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="lorem-ipsum-generator" Entry={ToolEntry} />;
}
