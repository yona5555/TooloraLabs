import { useTranslations } from "next-intl";

type DataSourceKey = "metalpriceApi" | "oilpriceApi" | "paxg" | "insee" | "fred";

const SOURCE_URLS: Record<DataSourceKey, string> = {
  metalpriceApi: "https://metalpriceapi.com/",
  oilpriceApi: "https://www.oilpriceapi.com/",
  paxg: "https://exchange.coinbase.com/",
  insee: "https://www.insee.fr/en/statistiques/serie/010002079",
  fred: "https://fred.stlouisfed.org/series/DCOILWTICO",
};

/** Per-section attribution: spot prices from MetalpriceAPI/OilPriceAPI; history from PAXG/USD (Coinbase), INSEE monthly London prices and EIA closes via FRED. */
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
