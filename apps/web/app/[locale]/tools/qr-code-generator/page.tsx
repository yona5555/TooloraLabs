import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/qr-code-generator";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "qr-code-generator");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="qr-code-generator" Entry={ToolEntry} />;
}
