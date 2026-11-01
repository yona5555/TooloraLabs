"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import CsvIndicatorCard, { CsvIndicatorUnavailable } from "./CsvIndicatorCard";
import { TYPE_FILL, useCsvModel } from "./CsvLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const MAX_ROWS = 14;

/**
 * Type #19 (Zone Strip): the table as a grid — one cell per value, coloured by its column's type,
 * amber where the cell is empty — so gaps and sparse columns stand out before the data is used.
 */
export default function CsvFillGrid() {
  const t = useTranslations("tools.csv-json-converter.education.lab.fill");
  const { a, f, pct } = useCsvModel();
  if (!a) return <CsvIndicatorUnavailable title={t("title")} />;

  const rows = a.rows.slice(0, MAX_ROWS);
  const cw = W / a.columns.length;
  const ch = Math.min(18, 220 / Math.max(1, rows.length));
  const H = rows.length * ch + 24;
  const emptyTotal = a.columns.reduce((s, c) => s + c.empty, 0);
  const cells = a.rows.length * a.columns.length;
  const sparse = [...a.columns].sort((x, y) => y.empty - x.empty)[0];

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {rows.map((r, i) =>
        r.map((v, k) => (
          <rect
            key={`${i}-${k}`}
            x={k * cw + 1}
            y={i * ch + 1}
            width={cw - 2}
            height={ch - 2}
            rx={2}
            className={v === "" ? "fill-amber-400 dark:fill-amber-500" : TYPE_FILL[a.columns[k].type]}
            opacity={v === "" ? 1 : 0.8}
          />
        )),
      )}
      {a.columns.map((c, k) => (
        <text style={{ fontSize: svgPx(12) }} key={c.name} x={k * cw + cw / 2} y={H - 6} textAnchor="middle" fontFamily="var(--font-mono)" className="fill-zinc-500 dark:fill-zinc-400">
          {c.name.length > cw / 7 ? `${c.name.slice(0, Math.max(2, Math.floor(cw / 7) - 1))}…` : c.name}
        </text>
      ))}
    </FitSvg>
  );

  return (
    <CsvIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("cells"), value: f(cells) },
        { label: t("empty"), value: f(emptyTotal) },
        { label: t("sparse"), value: sparse.empty ? `${sparse.name} · ${f(sparse.empty)}` : "—" },
        { label: t("complete"), value: f(a.rows.filter((r) => r.every((v) => v !== "")).length) },
        { label: t("filledShare"), value: pct(cells - emptyTotal, cells), emphasize: true },
      ]}
    />
  );
}
