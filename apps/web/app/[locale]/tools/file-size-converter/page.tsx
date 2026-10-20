import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/file-size-converter";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "file-size-converter");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="file-size-converter" Entry={ToolEntry} />;
}
