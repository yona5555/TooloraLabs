"use client";
import { useTranslations } from "next-intl";
import { Home, Moon, Plus, Sun, X } from "lucide-react";
import { isDstActive, wtSolarElevation, wtSolarPosition, zonedParts, zoneOffsetMinutes, type WtCity } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WtCityPicker from "./WtCityPicker";
import { MAX_CITIES, useNow, type CardProps } from "./state";
import { px2 } from "@/components/tool-ui/indicator-kit/SvgBits";

function AnalogClock({ h, m, sec, night }: { h: number; m: number; sec: number; night: boolean }) {
  const hand = (deg: number, len: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return { x2: px2(40 + len * Math.cos(a)), y2: px2(40 + len * Math.sin(a)) };
  };
  return (
    <svg width={64} height={64} viewBox="0 0 80 80" aria-hidden className="shrink-0">
      <circle cx={40} cy={40} r={37} fill={night ? "#1e293b" : "#fef9c3"} stroke={night ? "#60a5fa" : "#f59e0b"} strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return <line key={i} x1={px2(40 + 30 * Math.sin(a))} y1={px2(40 - 30 * Math.cos(a))} x2={px2(40 + 34 * Math.sin(a))} y2={px2(40 - 34 * Math.cos(a))} stroke={night ? "#cbd5e1" : "#78350f"} strokeWidth={i % 3 === 0 ? 2.5 : 1} />;
      })}
      <line x1={40} y1={40} {...hand((h % 12) * 30 + m * 0.5, 18)} stroke={night ? "#f8fafc" : "#1c1917"} strokeWidth={4} strokeLinecap="round" />
      <line x1={40} y1={40} {...hand(m * 6 + sec * 0.1, 27)} stroke={night ? "#f8fafc" : "#1c1917"} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={40} y1={40} {...hand(sec * 6, 30)} stroke="#ef4444" strokeWidth={1.2} />
      <circle cx={40} cy={40} r={2.5} fill="#ef4444" />
    </svg>
  );
}

/** Live clock grid of the chosen cities: ticks every second, add/remove/make home (saved per visitor). */
export default function WorldClockGrid({ s, set, d, f }: CardProps) {
  const now = useNow();
  const t = useTranslations("tools.world-time-converter.wt.clock");
  const sun = wtSolarPosition(now);
  const sub = { lat: sun.subsolarLatDeg, lon: sun.subsolarLonDeg };
  const setFrom = (id: string) => set({ from: id, cities: [...s.cities.filter((c) => c !== id), s.from] });

  return (
    <SectionCard id="world-clock" title={t("title")} bodyClassName="p-4">
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {d.all.map((c: WtCity, i) => {
          const p = zonedParts(now, c.zone);
          const el = wtSolarElevation({ lat: c.lat, lon: c.lon }, sub);
          const night = el < -0.833;
          const off = zoneOffsetMinutes(now, c.zone);
          return (
            <div key={c.id} className={`relative flex items-center gap-3 rounded-xl border p-2.5 ${i === 0 ? "border-blue-400 bg-blue-50/60 dark:border-blue-500/50 dark:bg-blue-500/10" : "border-zinc-200 dark:border-zinc-700"}`}>
              <AnalogClock h={p.hour} m={p.minute} sec={p.second} night={night} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {i === 0 && <Home size={12} className="shrink-0 text-blue-600 dark:text-blue-300" />}
                  <span className="truncate">{f.city(c)}</span>
                </p>
                <p dir="ltr" className="text-start font-mono text-lg leading-6 font-bold text-zinc-800 tabular-nums dark:text-zinc-100" suppressHydrationWarning>
                  {f.timeSec(now, c.zone)}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {f.date(now, c.zone)} · <bdi dir="ltr">{f.offset(off)}</bdi>
                  {isDstActive(now, c.zone) ? ` · ${t("dst")}` : ""}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {night ? <Moon size={11} className="text-blue-400" /> : <Sun size={11} className="text-amber-500" />}
                  {t("sun", { el: f.signed(Math.round(el * 10) / 10) })}
                </p>
              </div>
              {i > 0 && (
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => set({ cities: s.cities.filter((x) => x !== c.id) })} aria-label={t("remove", { city: f.city(c) })} className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                    <X size={13} />
                  </button>
                  <button type="button" onClick={() => setFrom(c.id)} aria-label={t("makeHome", { city: f.city(c) })} title={t("makeHome", { city: f.city(c) })} className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10">
                    <Home size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {s.cities.length < MAX_CITIES && (
          <WtCityPicker
            f={f}
            onPick={(id) => set({ cities: [...s.cities, id] })}
            exclude={[s.from, ...s.cities]}
            ariaLabel={t("add")}
            buttonClassName="flex h-full min-h-[84px] w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-zinc-600 dark:text-blue-300 dark:hover:bg-blue-500/10"
            buttonContent={
              <>
                <Plus size={16} />
                {t("add")}
              </>
            }
          />
        )}
      </div>
    </SectionCard>
  );
}
