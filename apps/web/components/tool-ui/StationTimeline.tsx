/**
 * Numbered stations joined by a line (the "real steps behind" cards). Desktop: one row, stations
 * spread across a fixed minimum width. Phone (below md): the row is too narrow for the stations, so it
 * becomes a vertical list (number at the start, name and value beside it) and nothing scrolls sideways.
 */
export const STATION_OL = "flex items-start justify-between gap-2 max-md:min-w-0 max-md:flex-col max-md:gap-3";
export const STATION_LI = "flex flex-1 flex-col items-center text-center max-md:grid max-md:w-full max-md:grid-cols-[2rem_minmax(0,1fr)] max-md:items-center max-md:gap-x-3 max-md:text-start";
export const STATION_MARK_ROW = "flex w-full items-center max-md:row-span-2 max-md:w-auto";
export const STATION_LINE_HIDE = "max-md:hidden";
export const STATION_NAME = "mt-2 max-md:mt-0";
export const STATION_VALUE = "mt-1 max-md:mt-0";

export default function StationTimeline({ stations, minWidth }: { stations: { key: string; label: string; value: string }[]; minWidth: string }) {
  return (
    <ol className={`${STATION_OL} ${minWidth}`}>
      {stations.map((s, i) => (
        <li key={s.key} className={STATION_LI}>
          <div className={STATION_MARK_ROW}>
            <div className={`h-px flex-1 ${STATION_LINE_HIDE} ${i === 0 ? "opacity-0" : "bg-blue-300 dark:bg-blue-500/40"}`} />
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{i + 1}</div>
            <div className={`h-px flex-1 ${STATION_LINE_HIDE} ${i === stations.length - 1 ? "opacity-0" : "bg-blue-300 dark:bg-blue-500/40"}`} />
          </div>
          <p className={`${STATION_NAME} text-xs font-semibold text-zinc-700 dark:text-zinc-200`}>{s.label}</p>
          <p className={`${STATION_VALUE} font-mono text-xs text-blue-700 dark:text-blue-300`}>{s.value}</p>
        </li>
      ))}
    </ol>
  );
}
