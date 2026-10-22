import type { Metadata } from "next";
import ToolEntry from "@/components/tools/entries/countdown-to-event-calculator";
import { ToolPageView, toolPageMetadata, type ToolRouteProps } from "@/lib/tool-page";

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  return toolPageMetadata((await params).locale, "countdown-to-event-calculator");
}

export default async function Page({ params }: ToolRouteProps) {
  return <ToolPageView locale={(await params).locale} slug="countdown-to-event-calculator" Entry={ToolEntry} />;
}
