import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/duplicate-line-remover";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "duplicate-line-remover");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="duplicate-line-remover" Entry={ToolEntry} />;
}
