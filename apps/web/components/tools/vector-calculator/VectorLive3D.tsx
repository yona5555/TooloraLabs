"use client";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import LiveTable3DLayout, { type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { useVectorAnalysis } from "./VectorLiveContext";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const VectorScene3D = dynamic(() => import("./VectorScene3D"), { ssr: false });

/** Deep live table (inputs → substituted steps → results → related quantities) + the 3D vector drawing. */
export default function VectorLive3D() {
  const t = useTranslations("tools.vector-calculator.live3d");
  const tc = useTranslations("common.live3d");
  const { r, f, n, vf, vn } = useVectorAnalysis();
  const na = t("notApplicable");
  const [ax, ay, az] = r.a;
  const [bx, by, bz] = r.b;
  const or = <T,>(v: T | null, show: (x: T) => string) => (v === null ? na : show(v));

  const groups: LiveTableGroup[] = [
    {
      title: t("groups.inputs"),
      rows: [
        { label: t("rows.vectorA"), formula: "A = (ax, ay, az)", value: vf(r.a) },
        { label: t("rows.vectorB"), formula: "B = (bx, by, bz)", value: vf(r.b) },
      ],
    },
    {
      title: t("groups.magnitudes"),
      rows: [
        { label: t("rows.magA"), formula: `√(${n(ax)}² + ${n(ay)}² + ${n(az)}²)`, value: f(r.magA, 4) },
        { label: t("rows.magB"), formula: `√(${n(bx)}² + ${n(by)}² + ${n(bz)}²)`, value: f(r.magB, 4) },
      ],
    },
    {
      title: t("groups.sumDiff"),
      rows: [
        { label: t("rows.sum"), formula: `(${n(ax)}+${n(bx)}, ${n(ay)}+${n(by)}, ${n(az)}+${n(bz)})`, value: vf(r.sum), emphasize: true },
        { label: t("rows.magSum"), formula: "|A + B|", value: f(r.magSum, 4) },
        { label: t("rows.diff"), formula: `(${n(ax)}−${n(bx)}, ${n(ay)}−${n(by)}, ${n(az)}−${n(bz)})`, value: vf(r.diff) },
        { label: t("rows.magDiff"), formula: "|A − B|", value: f(r.magDiff, 4) },
      ],
    },
    {
      title: t("groups.dotAngle"),
      rows: [
        { label: t("rows.dot"), formula: `${n(ax)}×${n(bx)} + ${n(ay)}×${n(by)} + ${n(az)}×${n(bz)}`, value: f(r.dot, 4), emphasize: true },
        { label: t("rows.cos"), formula: `${n(r.dot)} ÷ (${n(r.magA)} × ${n(r.magB)})`, value: or(r.cos, (c) => f(c, 4)) },
        { label: t("rows.angleDeg"), formula: "θ = cos⁻¹(cos θ)", value: or(r.angleDeg, (d) => f(d, 3)), unit: r.angleDeg === null ? undefined : "°", emphasize: true },
        { label: t("rows.angleRad"), formula: "θ × π ÷ 180", value: or(r.angleRad, (d) => f(d, 4)), unit: r.angleRad === null ? undefined : "rad" },
        { label: t("rows.relation"), formula: "cos θ", value: t(`relation.${r.relation}`) },
      ],
    },
    {
      title: t("groups.cross"),
      rows: [
        { label: t("rows.cross"), formula: `(${n(ay)}×${n(bz)}−${n(az)}×${n(by)}, …)`, value: vf(r.cross), emphasize: true },
        { label: t("rows.crossMag"), formula: `√(${r.cross.map((c) => `${n(c)}²`).join(" + ")})`, value: f(r.crossMag, 4) },
        { label: t("rows.triangleArea"), formula: `½ × ${n(r.crossMag)}`, value: f(r.triangleArea, 4) },
        { label: t("rows.lagrange"), formula: `${n(r.dotSquared)} + ${n(r.crossSquared)}`, value: f(r.lagrangeTotal, 4) },
      ],
    },
    {
      title: t("groups.projection"),
      rows: [
        { label: t("rows.compAonB"), formula: `${n(r.dot)} ÷ ${n(r.magB)}`, value: or(r.compAonB, (c) => f(c, 4)) },
        { label: t("rows.projAonB"), formula: `(${n(r.dot)} ÷ ${n(r.magB * r.magB)}) × B`, value: or(r.projAonB, (v) => vf(v)) },
        { label: t("rows.rejAfromB"), formula: "A − projᴮA", value: or(r.rejAfromB, (v) => vf(v)) },
        { label: t("rows.rejMag"), formula: `${n(r.crossMag)} ÷ ${n(r.magB)}`, value: or(r.rejMag, (v) => f(v, 4)) },
      ],
    },
    {
      title: t("groups.direction"),
      rows: [
        { label: t("rows.unitA"), formula: `A ÷ ${n(r.magA)}`, value: or(r.unitA, (v) => vf(v, 4)) },
        { label: t("rows.unitB"), formula: `B ÷ ${n(r.magB)}`, value: or(r.unitB, (v) => vf(v, 4)) },
        { label: t("rows.dirAnglesA"), formula: "cos⁻¹(aᵢ ÷ |A|)", value: or(r.dirAnglesA, (v) => `${vf(v, 1)}°`) },
      ],
    },
  ];

  const angleText = r.angleDeg === null ? "θ" : `θ = ${n(r.angleDeg, 1)}°`;

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      drawing={
        <Scene3D camera={[5.5, 4.6, 6.8]}>
          <VectorScene3D
            a={r.a}
            b={r.b}
            sum={r.sum}
            cross={r.cross}
            proj={r.projAonB}
            labels={{
              a: `A ${vn(r.a, 2)}`,
              b: `B ${vn(r.b, 2)}`,
              sum: "A+B",
              cross: `A×B ${vn(r.cross, 2)}`,
              proj: "projᴮA",
              angle: angleText,
              area: `▱ ${n(r.crossMag, 2)}`,
            }}
          />
        </Scene3D>
      }
    />
  );
}
