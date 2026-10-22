"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { QR_REGIONS, type QRRegion } from "@tooloralabs/tools";
import QRIndicatorCard, { QRIndicatorUnavailable } from "./QRIndicatorCard";
import { REGION_FILL, useQRModel } from "./QRLiveContext";

const SIZE = 260;

/**
 * Interactive piece: the real symbol on the page, module by module. Pick a part — finder, timing,
 * alignment, format/version information or data — and only its modules light up in colour, with
 * its module count and dark share in the table.
 */
export default function QRModuleMap() {
  const t = useTranslations("tools.qr-code-generator.education.lab.map");
  const tr = useTranslations("tools.qr-code-generator.education.lab.regions");
  const { a, f, pct } = useQRModel();
  const [focus, setFocus] = useState<QRRegion | "all">("all");
  if (!a) return <QRIndicatorUnavailable title={t("title")} />;

  const cell = SIZE / a.size;
  const present = QR_REGIONS.filter((r) => a.regionCounts[r] > 0);
  const sel = focus !== "all" && a.regionCounts[focus] > 0 ? focus : "all";

  const indicator = (
    <div className="w-[260px] max-w-full">
      <svg direction="ltr" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full rounded-md bg-white dark:bg-zinc-950">
        {a.dark.map((d, i) => {
          const region = a.regions[i];
          const lit = sel === "all" || region === sel;
          if (!d && !(lit && sel !== "all")) return null;
          const x = (i % a.size) * cell;
          const y = Math.floor(i / a.size) * cell;
          if (!d) return <rect key={i} x={x} y={y} width={cell + 0.05} height={cell + 0.05} className={`${REGION_FILL[region]} opacity-15`} />;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={cell + 0.05}
              height={cell + 0.05}
              className={lit ? (sel === "all" && region === "data" ? REGION_FILL.data : REGION_FILL[region]) : "fill-zinc-200 dark:fill-zinc-800"}
            />
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {(["all", ...present] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setFocus(r)}
            aria-pressed={sel === r}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${sel === r ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 text-zinc-600 hover:border-blue-400 dark:border-zinc-600 dark:text-zinc-300"}`}
          >
            {r === "all" ? t("all") : tr(r)}
          </button>
        ))}
      </div>
    </div>
  );

  const total = a.size * a.size;
  const rows =
    sel === "all"
      ? [
          { label: t("grid"), value: `${a.size} × ${a.size} = ${f(total)}` },
          { label: tr("data"), value: `${f(a.regionCounts.data)} (${pct(a.regionCounts.data, total)})` },
          { label: t("fixed"), value: `${f(total - a.regionCounts.data)} (${pct(total - a.regionCounts.data, total)})` },
          { label: t("mask"), value: String(a.mask) },
          { label: t("version"), value: `${a.version} · 17 + 4 × ${a.version} = ${a.size}`, emphasize: true },
        ]
      : [
          { label: t("modules"), value: f(a.regionCounts[sel]) },
          { label: t("share"), value: pct(a.regionCounts[sel], total) },
          { label: t("darkModules"), value: f(a.regionDark[sel]) },
          { label: t("darkShare"), value: pct(a.regionDark[sel], a.regionCounts[sel]) },
          { label: t("role"), value: t(`roles.${sel}`), emphasize: true },
        ];

  return <QRIndicatorCard title={t("title")} intro={t("intro")} indicator={indicator} rows={rows} />;
}
