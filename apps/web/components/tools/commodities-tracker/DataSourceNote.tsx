import { useTranslations } from "next-intl";

type DataSourceKey = "metalpriceApi" | "oilpriceApi";

const SOURCE_URLS: Record<DataSourceKey, string> = {
  metalpriceApi: "https://metalpriceapi.com/",
  oilpriceApi: "https://www.oilpriceapi.com/",
};

/** Per-section attribution, same pattern as forex-converter's DataSourceNote — gold/silver come from MetalpriceAPI (also the sole source for the historical chart, see ROADMAP.md §10), oil from OilPriceAPI. */
export default function DataSourceNote({ sourceKey, className = "" }: { sourceKey: DataSourceKey; className?: string }) {
  const t = useTranslations("tools.commodities-tracker.dataSource");
  const url = SOURCE_URLS[sourceKey];

  return (
    <p className={`text-xs text-zinc-400 dark:text-zinc-600 ${className}`}>
      {t(sourceKey)}{" "}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        className="underline decoration-dotted underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-400"
      >
        {url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
      </a>
    </p>
  );
}
