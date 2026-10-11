"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Circle, Coordinates, Line, Mafs, Polygon, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { circleDisplayScale, circleRoundSignificant, circleSquares } from "@tooloralabs/tools";
import IndicatorCard from "@/components/tools/markets/IndicatorCard";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { useCircleLive, useCircleRadius } from "./CircleLiveContext";

const LIGHT = { blue: "#2563eb", red: "#dc2626", green: "#059669", amber: "#d97706", muted: "#71717a" };
const DARK = { blue: "#60a5fa", red: "#f87171", green: "#34d399", amber: "#fbbf24", muted: "#a1a1aa" };
const U_MIN = 0.1;
const U_MAX = 2;

/**
 * The "wow" piece (§36 drag lab): drag the red handle to change the radius. The handle writes
 * back to the above-the-fold input (switching it to "radius"), so the Result card, the 3D table
 * and every indicator on the page follow the drag live. The axis is in a round 1/2/5 × 10ⁿ
 * display scale, so a coin and a Ferris wheel are both readable.
 */
export default function CircleRadiusLab() {
  const t = useTranslations("tools.circle-calculator.ind");
  const tf = useTranslations("tools.circle-calculator.form.fields");
  const dark = useIsDarkMode();
  const c = dark ? DARK : LIGHT;
  const { setDim } = useCircleLive();
  const { r, fmt } = useCircleRadius();
  const { f, n } = fmt;

  const [scale, setScale] = useState(() => circleDisplayScale(r));
  const outOfRange = r / scale < U_MIN * 0.9 || r / scale > U_MAX * 1.02;
  if (outOfRange) setScale(circleDisplayScale(r));
  const u = r / scale;

  const handle = useMovablePoint([u, 0], {
    color: c.red,
    constrain: ([x]) => [Math.min(U_MAX, Math.max(U_MIN, x)), 0],
  });

  const last = useRef(u);
  const suppress = useRef(false);

  // External change (typing, quick example) → move the handle without writing back.
  useEffect(() => {
    if (Math.abs(u - last.current) > 1e-9) {
      last.current = u;
      if (Math.abs(handle.point[0] - u) > 1e-9) {
        suppress.current = true;
        handle.setPoint([Math.min(U_MAX, Math.max(U_MIN, u)), 0]);
      }
    }
  }, [u, handle]);

  // Drag → write the rounded radius back to the tool's input.
  useEffect(() => {
    if (suppress.current) {
      suppress.current = false;
      return;
    }
    const x = handle.point[0];
    if (Math.abs(x - last.current) > 1e-3) {
      const nr = circleRoundSignificant(x * scale, 3);
      last.current = nr / scale;
      setDim("knownField", "radius");
      setDim("value", String(nr));
    }
  }, [handle.point, scale, setDim]);

  const hu = handle.point[0];
  const s = hu / Math.SQRT2;
  const sq = circleSquares(r);
  const A = Math.PI * r * r;

  return (
    <IndicatorCard
      id="radius-lab"
      title={t("lab.title")}
      heading={t("lab.heading")}
      intro={t("lab.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("lab.rowScale"), value: `1 = ${n(scale)}` },
          { label: tf("radius"), value: `r = ${f(r)}` },
          { label: tf("diameter"), value: `2r = ${f(2 * r)}` },
          { label: tf("circumference"), value: `2π × ${n(r)} = ${f(2 * Math.PI * r)}` },
          { label: t("lab.rowInside"), value: `2r² = ${f(sq.inscribedArea)}` },
          { label: t("lab.rowOutside"), value: `4r² = ${f(sq.circumscribedArea)}` },
          { label: tf("area"), value: `π × ${n(r)}² = ${f(A)}`, emphasize: true },
        ],
      }}
    >
      <div dir="ltr" className="mafs-canvas w-full overflow-hidden rounded-xl" aria-label={t("lab.aria")}>
        <Mafs viewBox={{ x: [-2.3, 2.3], y: [-2.3, 2.3] }} height={320} pan={false} zoom={false}>
          {/* A radius is never negative: label only the positive whole grid steps (1, 2), so the
              tick labels stay far apart at any scale and in every locale. */}
          <Coordinates.Cartesian
            xAxis={{
              lines: 0.5,
              // Hide the tick under the handle and the r label so they never collide.
              labels: (x) => (x > 0 && Math.abs(x - Math.round(x)) < 1e-9 && Math.abs(x - hu) > 0.45 ? n(x * scale) : ""),
            }}
            yAxis={{ lines: 0.5, labels: false }}
          />
          <Polygon points={[[hu, hu], [-hu, hu], [-hu, -hu], [hu, -hu]]} color={c.muted} fillOpacity={0} strokeStyle="dashed" weight={1.5} />
          <Circle center={[0, 0]} radius={hu} color={c.blue} fillOpacity={0.14} weight={2.5} />
          <Polygon points={[[s, s], [-s, s], [-s, -s], [s, -s]]} color={c.amber} fillOpacity={0.12} weight={1.5} />
          <Line.Segment point1={[0, -hu]} point2={[0, hu]} color={c.green} weight={2.5} />
          <Line.Segment point1={[0, 0]} point2={[hu, 0]} color={c.red} weight={3} />
          {/* Labels sit outside the circle and its squares, so no line ever crosses them. */}
          <Text x={hu + 0.14} y={0.06} attach="ne" size={13} color={c.red}>{`r = ${n(r)}`}</Text>
          <Text x={0} y={hu + 0.06} attach="n" size={13} color={c.green}>{`d = ${n(2 * r)}`}</Text>
          <Text x={0} y={-hu - 0.06} attach="s" size={12} color={c.blue}>{`A = ${n(A)}`}</Text>
          {handle.element}
        </Mafs>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-red-600 dark:bg-red-400" />{t("lab.legendRadius")}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border-2 border-amber-600 dark:border-amber-400" />{t("lab.legendInside")}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border-2 border-dashed border-zinc-500" />{t("lab.legendOutside")}</span>
      </div>
    </IndicatorCard>
  );
}
