import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/step-by-step-math-solver";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "step-by-step-math-solver");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="step-by-step-math-solver" Entry={ToolEntry} />;
}
