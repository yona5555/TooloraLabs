import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/file-name-sanitizer";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "file-name-sanitizer");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="file-name-sanitizer" Entry={ToolEntry} />;
}
