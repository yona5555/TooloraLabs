import { useTranslations } from "next-intl";

/** Required attribution under Open-Meteo's CC BY 4.0 data licence, not just a nice-to-have — see SECURITY-NOTES.md. */
export default function WeatherDataSourceNote({ className = "" }: { className?: string }) {
  const t = useTranslations("tools.weather-forecast.dataSource");

  return (
    <p className={`text-xs text-zinc-400 dark:text-zinc-600 ${className}`}>
      {t("label")}{" "}
      <a
        href="https://open-meteo.com/"
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        className="underline decoration-dotted underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-400"
      >
        open-meteo.com
      </a>
    </p>
  );
}
