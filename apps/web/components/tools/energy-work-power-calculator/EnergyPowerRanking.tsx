"use client";
import { useTranslations } from "next-intl";
import { BULB_WATTS, rankPower } from "@tooloralabs/tools";
import EnergyIndicatorCard, { EnergyIndicatorUnavailable } from "./EnergyIndicatorCard";
import { useEnergyModel } from "./EnergyLiveContext";

/**
 * Type #5 (Ranked Horizontal Bar List): your power P = W / t ranked among typical power ratings of
 * everyday devices and the resting human body, highest first. Bar length follows log₁₀ P so a
 * 10 W bulb and a 100 kW engine both stay readable.
 */
export default function EnergyPowerRanking() {
  const t = useTranslations("tools.energy-work-power-calculator.education.lab.power");
  const tDevices = useTranslations("tools.energy-work-power-calculator.referenceTable.devices");
  const { power, f } = useEnergyModel();
  if (!power || power.power <= 0) return <EnergyIndicatorUnavailable title={t("title")} />;

  const rows = rankPower(power.power);
  const logs = rows.map((r) => Math.log10(r.power));
  const lo = Math.min(...logs) - 0.5;
  const hi = Math.max(...logs);
  const idx = rows.findIndex((r) => r.key === "yours");
  const above = rows[idx - 1];
  const below = rows[idx + 1];
  const name = (key: string) => (key === "yours" ? t("yours") : key === "carEngine" ? t("carEngine") : tDevices(key));

  const list = (
    <div className="w-full max-w-[360px] sm:w-[360px]">
      <ol className="space-y-1.5">
        {rows.map((r) => {
          const mine = r.key === "yours";
          return (
            <li key={r.key} className="grid grid-cols-[96px_1fr] items-center gap-2 text-xs">
              <span className={`truncate ${mine ? "font-bold text-amber-600 dark:text-amber-400" : "text-zinc-600 dark:text-zinc-300"}`}>{name(r.key)}</span>
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className={`h-3.5 shrink-0 rounded-sm ${mine ? "bg-amber-500 dark:bg-amber-400" : "bg-zinc-400 dark:bg-zinc-500"}`}
                  style={{ width: `${Math.max(2, ((Math.log10(r.power) - lo) / (hi - lo)) * 64)}%` }}
                />
                <span dir="ltr" className="font-mono whitespace-nowrap text-zinc-700 dark:text-zinc-200">{`${f(r.power, 2)} W`}</span>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">{t("source")}</p>
    </div>
  );

  return (
    <EnergyIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={list}
      rows={[
        { label: "P = W / t", value: `${f(power.work)} / ${f(power.time)} = ${f(power.power)} W`, emphasize: true },
        { label: t("rank"), value: `${idx + 1} / ${rows.length}` },
        ...(above ? [{ label: t("above"), value: `${name(above.key)} · ${f(above.power / power.power)} ×` }] : []),
        ...(below ? [{ label: t("below"), value: `${name(below.key)} · ${f(power.power / below.power)} ×` }] : []),
        { label: t("bulbs"), value: `${f(power.power)} / ${BULB_WATTS} = ${f(power.bulbs, 2)}` },
      ]}
    />
  );
}
