import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/base64-tool";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "base64-tool");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="base64-tool" Entry={ToolEntry} />;
}
