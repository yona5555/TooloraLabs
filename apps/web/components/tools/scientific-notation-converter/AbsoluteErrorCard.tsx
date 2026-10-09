"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue, standardValueOf } from "@tooloralabs/tools";

const DIGITS_RANGE = [0, 1, 2, 3, 4, 5, 6];

/** A real curve: round the live coefficient to k decimal digits for k = 0..6, and plot the actual
 * absolute error in standard-value terms at each point -- drag along the curve to pick k. */
export default function AbsoluteErrorCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.absoluteError");
  const { dims, setDim } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const exactStandard = standardValueOf(derivedA.coefficient, derivedA.exponent);
  const points = DIGITS_RANGE.map((k) => {
    const roundedCoeff = Number(derivedA.coefficient.toFixed(k));
    const roundedStandard = standardValueOf(roundedCoeff, derivedA.exponent);
    return { k, error: Math.abs(exactStandard - roundedStandard) };
  });
  const maxErr = Math.max(...points.map((p) => p.error), 1e-9);
  const w = 180;
  const h = 90;
  const toX = (k: number) => 10 + (k / 6) * (w - 20);
  const toY = (err: number) => h - 10 - (Math.log10(err + 1e-12) - Math.log10(maxErr + 1e-12) + 10) * 6;

  function handlePointer(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * w;
    const k = Math.max(0, Math.min(6, Math.round(((x - 10) / (w - 20)) * 6)));
    setDim("coefficientA", Number(derivedA.coefficient.toFixed(k)));
  }

  return (
    <GlassIndicatorCard
      n={10}
      accent="blue"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="touch-none" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); }} onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}>
          <path d={points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.k)} ${Math.max(5, Math.min(h - 5, toY(p.error)))}`).join(" ")} fill="none" stroke="#5B6EF5" strokeWidth={2} />
          {points.map((p) => (
            <circle key={p.k} cx={toX(p.k)} cy={Math.max(5, Math.min(h - 5, toY(p.error)))} r={2.5} fill="#4552D6" />
          ))}
        </svg>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colDigitsKept") },
            { key: "v", label: t("colError") },
          ]}
          rows={points.map((p) => ({ k: formatSciValue(p.k), v: formatSciValue(p.error) }))}
        />
      }
    />
  );
}
