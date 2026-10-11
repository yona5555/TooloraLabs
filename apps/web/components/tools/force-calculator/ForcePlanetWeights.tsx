"use client";
import { useTranslations } from "next-intl";
import { surfaceWeights } from "@tooloralabs/tools";
import ForceIndicatorCard, { ForceIndicatorUnavailable } from "./ForceIndicatorCard";
import { useForceModel } from "./ForceLiveContext";

/**
 * Type #5 (Ranked Horizontal Bar List): the gravitational force F = GMm₂/R² on mass m₂ at the
 * surface of the eight planets and the Moon (NASA Planetary Fact Sheet masses and mean radii),
 * heaviest first, with Earth highlighted.
 */
export default function ForcePlanetWeights() {
  const t = useTranslations("tools.force-calculator.education.lab.planets");
  const { gr, f } = useForceModel();
  if (!gr || gr.mass2 === 0) return <ForceIndicatorUnavailable title={t("title")} />;

  // The Sun (≈ 28 g) would flatten every planet bar, so the list covers the planets and the Moon.
  const rows = surfaceWeights(gr.mass2).filter((r) => r.key !== "sun");
  const max = Math.abs(rows[0].weight) || 1;
  const earth = rows.find((r) => r.key === "earth")!;
  const moon = rows.find((r) => r.key === "moon")!;

  const list = (
    <div className="w-full max-w-[360px] sm:w-[360px]">
      <p dir="ltr" className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{`m₂ = ${f(gr.mass2)} kg`}</p>
      <ol className="space-y-1.5">
        {rows.map((r) => {
          const isEarth = r.key === "earth";
          return (
            <li key={r.key} className="grid grid-cols-[72px_1fr] items-center gap-2 text-xs">
              <span className={`truncate ${isEarth ? "font-bold text-blue-700 dark:text-blue-300" : "text-zinc-600 dark:text-zinc-300"}`}>{t(`bodies.${r.key}`)}</span>
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className={`h-3.5 shrink-0 rounded-sm ${isEarth ? "bg-blue-600 dark:bg-blue-400" : "bg-zinc-400 dark:bg-zinc-500"}`}
                  style={{ width: `${Math.max(1.5, (Math.abs(r.weight) / max) * 70)}%` }}
                />
                <span dir="ltr" className="font-mono whitespace-nowrap text-zinc-700 dark:text-zinc-200">{`${f(r.weight, 2)} N`}</span>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">{t("source")}</p>
    </div>
  );

  return (
    <ForceIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={list}
      rows={[
        { label: "g (Earth)", value: `G M / R² = ${f(earth.gravity, 3)} m/s²` },
        { label: t("onEarth"), value: `${f(earth.gravity, 3)} × ${f(gr.mass2)} = ${f(earth.weight, 3)} N`, emphasize: true },
        { label: t("onMoon"), value: `${f(moon.weight, 3)} N`, note: t("moonShare", { pct: `${f((moon.gravity / earth.gravity) * 100, 1)}%` }) },
        { label: t("heaviest", { body: t(`bodies.${rows[0].key}`) }), value: `${f(rows[0].weight, 3)} N` },
      ]}
    />
  );
}
