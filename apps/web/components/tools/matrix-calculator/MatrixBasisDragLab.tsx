"use client";
import { useTranslations } from "next-intl";
import { Coordinates, Mafs, MovablePoint, Polygon, Text, Vector } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { classifyTransform2, columns2, det2 } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import MatrixIndicatorCard from "./MatrixIndicatorCard";
import { useMatrixLive, useMatrixModel } from "./MatrixLiveContext";

type V2 = [number, number];
const BUCKETS = [6, 12, 24, 48, 96, 192];
const LIGHT = { i: "#dc2626", j: "#059669", pos: "#2563eb", neg: "#d97706", muted: "#a1a1aa" };
const DARK = { i: "#f87171", j: "#34d399", pos: "#60a5fa", neg: "#fbbf24", muted: "#71717a" };

const snap = (v: number) => Math.round(v * 2) / 2;

/**
 * The page's "wow" piece (§36): drag where î and ĵ land and matrix A's first and second columns
 * are rewritten live in the inputs above, so the Result, the 3D cube and every indicator follow.
 * The view range is chosen from the current entries and the drag is kept inside 85% of it, so
 * the plane never re-zooms under the cursor mid-drag.
 */
export default function MatrixBasisDragLab() {
  const t = useTranslations("tools.matrix-calculator.education.lab.basisDrag");
  const tl = useTranslations("tools.matrix-calculator.live3d");
  const isDark = useIsDarkMode();
  const c = isDark ? DARK : LIGHT;
  const { setDim } = useMatrixLive();
  const { A, f } = useMatrixModel();

  // R ≥ 2.3 × the largest entry keeps the far corner (Aî + Aĵ) in view; dragging is held inside
  // 43% of R (snapped to 0.5), which never pushes R to the next bucket mid-drag.
  const maxAbs = Math.max(1, ...A.map(Math.abs));
  const R = BUCKETS.find((b) => b >= maxAbs * 2.3) ?? BUCKETS[BUCKETS.length - 1];
  const lim = Math.floor(R * 0.43 * 2) / 2;
  const clamp = (p: V2): V2 => [Math.max(-lim, Math.min(lim, snap(p[0]))), Math.max(-lim, Math.min(lim, snap(p[1])))];

  const ci: V2 = [A[0], A[2]];
  const cj: V2 = [A[1], A[3]];
  const d = det2(A);
  const cols = columns2(A);
  const fill = d < 0 ? c.neg : c.pos;
  const orientation = Math.abs(d) < 1e-12 ? tl("orientationCollapsed") : d > 0 ? tl("orientationKept") : tl("orientationFlipped");
  const step = R / 3;

  const plane = (
    <div className="w-full lg:w-[340px]">
      <div dir="ltr" aria-label={t("aria")} className="mafs-canvas w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [-R, R], y: [-R, R] }} height={300} pan={false} zoom={false} preserveAspectRatio="contain">
          <Coordinates.Cartesian xAxis={{ lines: step }} yAxis={{ lines: step }} />
          <Polygon points={[[0, 0], [1, 0], [1, 1], [0, 1]]} color={c.muted} fillOpacity={0.08} strokeStyle="dashed" />
          <Polygon points={[[0, 0], ci, [ci[0] + cj[0], ci[1] + cj[1]], cj]} color={fill} fillOpacity={0.22} />
          <Vector tip={ci} color={c.i} weight={3} />
          <Vector tip={cj} color={c.j} weight={3} />
          <Text x={(ci[0] + cj[0]) / 2} y={(ci[1] + cj[1]) / 2} size={13} color={fill}>
            {`det = ${f(d)}`}
          </Text>
          <MovablePoint point={ci} color={c.i} constrain={clamp} onMove={([x, y]) => { setDim("a11", String(x)); setDim("a21", String(y)); }} />
          <MovablePoint point={cj} color={c.j} constrain={clamp} onMove={([x, y]) => { setDim("a12", String(x)); setDim("a22", String(y)); }} />
        </Mafs>
      </div>
      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );

  return (
    <MatrixIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={plane}
      rows={[
        { label: t("col1"), value: `(${f(ci[0])}, ${f(ci[1])})` },
        { label: t("col2"), value: `(${f(cj[0])}, ${f(cj[1])})` },
        { label: t("lengths"), value: `${f(cols.len1)} · ${f(cols.len2)}` },
        { label: t("angle"), value: `${f(cols.angleDeg, 1)}°` },
        { label: t("det"), value: `${f(A[0])}×${f(A[3])} − ${f(A[1])}×${f(A[2])}` },
        { label: t("area"), value: f(Math.abs(d)) },
        { label: t("orientation"), value: orientation },
        { label: t("kind"), value: tl(`kinds.${classifyTransform2(A)}`), emphasize: true },
      ]}
    />
  );
}
