import type { ComponentType } from "react";
import type { Metadata } from "next";
import type { ToolEntryProps } from "@/components/tools/entries/types";
import CryptoConverterEntry from "@/components/tools/entries/crypto-converter";
import ForexConverterEntry from "@/components/tools/entries/forex-converter";
import CommoditiesTrackerEntry from "@/components/tools/entries/commodities-tracker";
import WeatherForecastEntry from "@/components/tools/entries/weather-forecast";
import { ToolPageView, toolPageMetadata } from "@/lib/tool-page";

type ToolPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

/**
 * Every other tool has its own static route folder next to this one; this
 * route serves only the four live-data tools. Excludes crypto-converter, forex-converter, commodities-tracker, and
 * weather-forecast: all four fetch live external data at render time
 * (CoinGecko; ExchangeRate-API + Frankfurter; MetalpriceAPI + OilPriceAPI;
 * MET Norway), so including them here would make `next build` itself
 * perform those fetches to prerender the page — burning limited free-tier
 * API quota on every build regardless of what changed, and failing the
 * whole build on a rate limit (429), as happened with CoinGecko on
 * 2026-08-08. Leaving them out of the static param list means
 * `dynamicParams` (default true) renders each on its first real request
 * instead, after which the `revalidate` window on their respective fetches
 * takes over as normal ISR.
 */
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  return toolPageMetadata(locale, slug);
}

const liveDataEntries: Record<string, ComponentType<ToolEntryProps>> = {
  "crypto-converter": CryptoConverterEntry,
  "forex-converter": ForexConverterEntry,
  "commodities-tracker": CommoditiesTrackerEntry,
  "weather-forecast": WeatherForecastEntry,
};

export default async function ToolPage({ params }: ToolPageProps) {
  const { locale, slug } = await params;
  return <ToolPageView locale={locale} slug={slug} Entry={liveDataEntries[slug]} />;
}
