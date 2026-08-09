import { useTranslations } from "next-intl";

type DataSourceKey = "exchangeRateApi" | "frankfurter";

const SOURCE_URLS: Record<DataSourceKey, string> = {
  exchangeRateApi: "https://www.exchangerate-api.com/",
  frankfurter: "https://frankfurter.dev/",
};

/** Per-section attribution so a visitor always knows which of the two data providers (see §12 in project instructions — ExchangeRate-API cannot serve historical data on the free plan, so Frankfurter/ECB covers that one section only) backs the numbers in front of them. */
export default function DataSourceNote({ sourceKey, className = "" }: { sourceKey: DataSourceKey; className?: string }) {
  const t = useTranslations("tools.forex-converter.dataSource");
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
