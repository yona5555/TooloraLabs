"use client";
import { useWxT } from "./wx";

const link = "underline decoration-dotted underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300";

/**
 * Source credits exactly as docs/legal/data-sources.md requires: MET Norway with the CC BY 4.0
 * licence link and a note that values were changed (converted/aggregated); USGS "courtesy of";
 * NASA EONET as the event source without implying endorsement. Map attribution (OpenFreeMap,
 * OpenMapTiles, OpenStreetMap) is shown inside the map by MapLibre.
 */
export default function WxCredits({ hazards = false, className = "" }: { hazards?: boolean; className?: string }) {
  const t = useWxT();
  return (
    <div className={`space-y-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400 ${className}`}>
      <p>
        {t("credits.met")}{" "}
        <a href="https://api.met.no/" target="_blank" rel="noopener noreferrer" dir="ltr" className={link}>MET Norway</a> (
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" dir="ltr" className={link}>CC BY 4.0</a>) — {t("credits.changes")}
      </p>
      {hazards && (
        <>
          <p>
            {t("credits.usgs")}{" "}
            <a href="https://earthquake.usgs.gov/earthquakes/feed/" target="_blank" rel="noopener noreferrer" dir="ltr" className={link}>courtesy of the U.S. Geological Survey</a>
          </p>
          <p>
            {t("credits.eonet")}{" "}
            <a href="https://eonet.gsfc.nasa.gov/" target="_blank" rel="noopener noreferrer" dir="ltr" className={link}>NASA EONET</a> — {t("credits.eonetNote")}
          </p>
          <p>{t("credits.map")}</p>
        </>
      )}
    </div>
  );
}
