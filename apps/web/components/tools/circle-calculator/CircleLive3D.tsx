"use client";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { CIRCLE_UNIT_FACTORS, circleSector, circleSolids, circleSquares } from "@tooloralabs/tools";
import LiveTable3DLayout, { type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { useCircleRadius, type CircleFormatters } from "./CircleLiveContext";
import type { CircleKnownField } from "./types";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const CircleScene3D = dynamic(() => import("./CircleScene3D"), { ssr: false });

type Props = { r: number; knownField: CircleKnownField; fmt: CircleFormatters };

/** Deep live table (left) + rotating 3D disk (right) for one radius. */
export default function CircleLive3D({ r, knownField, fmt }: Props) {
  const t = useTranslations("tools.circle-calculator.live3d");
  const tf = useTranslations("tools.circle-calculator.form.fields");
  const tc = useTranslations("common.live3d");
  const { f, n } = fmt;

  const d = 2 * r;
  const C = 2 * Math.PI * r;
  const A = Math.PI * r * r;
  const uL = t("units.len");
  const uA = t("units.area");
  const uV = t("units.vol");
  const sq = circleSquares(r);
  const so = circleSolids(r);
  const s90 = circleSector(r, 90);
  const s60 = circleSector(r, 60);

  const given: Record<CircleKnownField, { sym: string; value: number; unit: string; solve: string }> = {
    radius: { sym: "r", value: r, unit: uL, solve: `r = ${n(r)}` },
    diameter: { sym: "d", value: d, unit: uL, solve: `d ÷ 2 = ${n(d)} ÷ 2` },
    circumference: { sym: "C", value: C, unit: uL, solve: `C ÷ 2π = ${n(C)} ÷ 6.2832` },
    area: { sym: "A", value: A, unit: uA, solve: `√(A ÷ π) = √(${n(A)} ÷ 3.1416)` },
  };
  const g = given[knownField];

  const groups: LiveTableGroup[] = [
    {
      title: t("groups.given"),
      rows: [
        { label: tf(knownField), formula: `${g.sym} (${t("given")})`, value: f(g.value), unit: g.unit },
        { label: tf("radius"), formula: g.solve, value: f(r), unit: uL, emphasize: knownField !== "radius" },
      ],
    },
    {
      title: t("groups.core"),
      rows: [
        { label: tf("diameter"), formula: `2r = 2 × ${n(r)}`, value: f(d), unit: uL },
        { label: tf("circumference"), formula: `2πr = 2π × ${n(r)}`, value: f(C), unit: uL, emphasize: true },
        { label: tf("area"), formula: `πr² = π × ${n(r)}²`, value: f(A), unit: uA, emphasize: true },
        { label: t("rows.piCheck"), formula: `C ÷ d = ${n(C)} ÷ ${n(d)}`, value: f(C / d, 6) },
        { label: t("rows.areaPerRim"), formula: `A ÷ C = r ÷ 2`, value: f(A / C), unit: uL },
      ],
    },
    {
      title: t("groups.sectors"),
      rows: [
        { label: t("rows.arc", { deg: 90 }), formula: `C ÷ 4 = ${n(C)} ÷ 4`, value: f(s90.arcLength), unit: uL },
        { label: t("rows.sector", { deg: 90 }), formula: `A ÷ 4 = ${n(A)} ÷ 4`, value: f(s90.sectorArea), unit: uA },
        { label: t("rows.chord", { deg: 90 }), formula: `r√2 = ${n(r)} × 1.4142`, value: f(s90.chord), unit: uL },
        { label: t("rows.arc", { deg: 60 }), formula: `C ÷ 6 = ${n(C)} ÷ 6`, value: f(s60.arcLength), unit: uL },
        { label: t("rows.sector", { deg: 60 }), formula: `A ÷ 6 = ${n(A)} ÷ 6`, value: f(s60.sectorArea), unit: uA },
        { label: t("rows.segment", { deg: 60 }), formula: `½r²(θ − sin θ)`, value: f(s60.segmentArea), unit: uA },
      ],
    },
    {
      title: t("groups.squares"),
      rows: [
        { label: t("rows.inSquareSide"), formula: `r√2 = ${n(r)} × 1.4142`, value: f(sq.inscribedSide), unit: uL },
        { label: t("rows.inSquareArea"), formula: `2r² = 2 × ${n(r)}²`, value: f(sq.inscribedArea), unit: uA },
        { label: t("rows.outSquareArea"), formula: `(2r)² = ${n(d)}²`, value: f(sq.circumscribedArea), unit: uA },
        { label: t("rows.fill"), formula: `A ÷ (2r)² = π ÷ 4`, value: f((A / sq.circumscribedArea) * 100, 2), unit: "%" },
      ],
    },
    {
      title: t("groups.solids"),
      rows: [
        { label: t("rows.sphereVolume"), formula: `4/3 πr³ = 4/3 π × ${n(r)}³`, value: f(so.sphereVolume), unit: uV },
        { label: t("rows.sphereSurface"), formula: `4πr² = 4 × ${n(A)}`, value: f(so.sphereSurface), unit: uA },
        { label: t("rows.cylinderVolume"), formula: `πr² × 2r = ${n(A)} × ${n(d)}`, value: f(so.cylinderVolume), unit: uV },
      ],
    },
    {
      title: t("groups.conversions"),
      rows: [
        { label: t("rows.rInches"), formula: `r ÷ ${CIRCLE_UNIT_FACTORS.cmPerInch}`, value: f(r / CIRCLE_UNIT_FACTORS.cmPerInch), unit: "in" },
        { label: t("rows.aInches"), formula: `A ÷ ${CIRCLE_UNIT_FACTORS.cm2PerSquareInch}`, value: f(A / CIRCLE_UNIT_FACTORS.cm2PerSquareInch), unit: "in²" },
        { label: t("rows.cFeet"), formula: `C ÷ 0.3048`, value: f(C * CIRCLE_UNIT_FACTORS.feetPerMeter), unit: "ft" },
        { label: t("rows.aFeet"), formula: `A ÷ 0.3048²`, value: f(A * CIRCLE_UNIT_FACTORS.squareFeetPerSquareMeter), unit: "ft²" },
      ],
    },
  ];

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      drawing={
        <Scene3D camera={[4.2, 4.4, 5.4]} autoRotate>
          <CircleScene3D labels={{ r: `r = ${n(r)}`, d: `d = ${n(d)}`, c: `C = ${n(C)}`, a: `A = ${n(A)}` }} />
        </Scene3D>
      }
    />
  );
}

/** Education copy: follows the live input (holding the last valid radius mid-edit). */
export function CircleLive3DLive() {
  const { r, knownField, fmt } = useCircleRadius();
  return <CircleLive3D r={r} knownField={knownField} fmt={fmt} />;
}
