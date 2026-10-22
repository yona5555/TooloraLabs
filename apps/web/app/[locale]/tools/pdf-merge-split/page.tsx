import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/pdf-merge-split";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "pdf-merge-split");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="pdf-merge-split" Entry={ToolEntry} />;
}
