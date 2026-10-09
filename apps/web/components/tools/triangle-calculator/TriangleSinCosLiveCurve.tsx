"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Plot, Line, Point, Text, Theme } from "mafs";
import "mafs/core.css";
import "./triangleMafsTheme.css";
import { round, sinCosMarker } from "./triangleEducationMath";

type Props = { angles: { label: string; deg: number }[] };

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Shared live sin (red) / cos (green) companion placed under every interactive indicator's
 * drawing, in the same card (Yousef-approved exception to §32 item 6). Fixed height so it reads
 * the same on every indicator; markers and values follow the indicator's live angle(s).
 */
export default function TriangleSinCosLiveCurve({ angles }: Props) {
  const t = useTranslations("tools.triangle-calculator.education.lab.sinCos");
  const markers = angles.map((a) => sinCosMarker(a.label, a.deg));

  return (
    <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800" data-sincos-curve>
      <div dir="ltr" className="triangle-mafs w-full overflow-hidden rounded-xl" role="img" aria-label={t("aria")}>
        <Mafs viewBox={{ x: [-10, 190], y: [-1.25, 1.25] }} height={150} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian xAxis={{ lines: 30, labels: (deg) => `${deg}°` }} yAxis={{ lines: 0.5, labels: false }} />
          <Plot.OfX y={(deg) => Math.sin(toRad(deg))} domain={[0, 180]} color={Theme.red} weight={2.5} />
          <Plot.OfX y={(deg) => Math.cos(toRad(deg))} domain={[0, 180]} color={Theme.green} weight={2.5} />
          {markers.map((m) => (
            <g key={m.label}>
              <Line.Segment point1={[m.deg, -1.2]} point2={[m.deg, 1.02]} color={Theme.foreground} weight={1} style="dashed" opacity={0.35} />
              <Point x={m.deg} y={m.sin} color={Theme.red} />
              <Point x={m.deg} y={m.cos} color={Theme.green} />
              <Text x={m.deg} y={1.13} size={11} color={Theme.foreground}>
                {m.label}
              </Text>
            </g>
          ))}
        </Mafs>
      </div>
      <div dir="ltr" className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-xs">
        {markers.map((m) => (
          <span key={m.label} data-sincos-value={m.label}>
            <span className="font-semibold">{`${m.label} ${round(m.deg, 1)}°`}</span>{" "}
            <span className="text-red-600 dark:text-red-400">{`sin ${round(m.sin).toFixed(2)}`}</span>{" "}
            <span className="text-green-600 dark:text-green-400">{`cos ${round(m.cos).toFixed(2)}`}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
