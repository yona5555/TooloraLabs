"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { snapToScientificNotation, ScientificNotationConverter } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { MafsHoverPoint } from "@/components/tool-ui/MafsHoverPrimitives";

type Vector2 = [number, number];

const MIN_EXP = -12;
const MAX_EXP = 21;
const LIGHT = { blue: "#2563eb", fg: "#3f3f46" };
const DARK = { blue: "#60a5fa", fg: "#d4d4d8" };

const tool = new ScientificNotationConverter();

const REFERENCES: { exponent: number; labelKey: string }[] = [
  { exponent: -10, labelKey: "atom" },
  { exponent: -6, labelKey: "speck" },
  { exponent: 0, labelKey: "one" },
  { exponent: 6, labelKey: "million" },
  { exponent: 9, labelKey: "billion" },
  { exponent: 13, labelKey: "earthPopulationDigits" },
];

// The point's screen y sits in [-1, 1]; map that range onto a coefficient in [1, 10).
function yToCoefficient(y: number): number {
  return ((y + 1) / 2) * 9 + 1;
}
function coefficientToY(coefficient: number): number {
  return ((coefficient - 1) / 9) * 2 - 1;
}

/**
 * The hero indicator (§36): a single point whose x-position is the exponent and y-position is
 * the coefficient — drag it anywhere and the standard, scientific, and engineering forms all
 * recompute live via the real ScientificNotationConverter engine, with reference magnitudes
 * (an atom, a million, a billion...) marked along the same axis for scale.
 */
export default function ScientificNotationMagnitudeDrag() {
  const t = useTranslations("tools.scientific-notation-converter.education.hero");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;

  const point = useMovablePoint([4, coefficientToY(5)] as Vector2, {
    color: colors.blue,
    constrain: (p) => {
      const snapped = snapToScientificNotation(yToCoefficient(p[1]), p[0], MIN_EXP, MAX_EXP);
      return [snapped.exponent, coefficientToY(snapped.coefficient)];
    },
  });

  const snapped = snapToScientificNotation(yToCoefficient(point.point[1]), point.point[0], MIN_EXP, MAX_EXP);
  const output = tool.execute(
    { operation: "toStandard", standardValue: 0, coefficientA: snapped.coefficient, exponentA: snapped.exponent, coefficientB: 0, exponentB: 0 },
    { locale: "en-US" },
  );
  const data = output.success ? output.data : null;

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`${snapped.coefficient} × 10^${snapped.exponent}`}</span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{`${t("standardLabel")}: ${data ? data.standard.toLocaleString("en-US") : "—"}`}</span>
        {data?.numberName && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{t(`numberNames.${data.numberName}`)}</span>
        )}
      </div>

      <div dir="ltr" aria-label={t("ariaLabel")} className="mafs-canvas w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [MIN_EXP - 1.5, MAX_EXP + 1.5], y: [-1.2, 1.2] }} height={190} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian xAxis={{ lines: 3, labels: (v) => `10^${v}` }} yAxis={{ lines: false, axis: false }} />

          {REFERENCES.map((ref) => (
            <g key={ref.labelKey}>
              <MafsHoverPoint point={[ref.exponent, 0]} tooltip={t(`references.${ref.labelKey}`)} radiusPx={10} />
              <Text x={ref.exponent} y={-0.75} size={9} color={colors.fg}>
                {t(`references.${ref.labelKey}Short`)}
              </Text>
            </g>
          ))}

          {point.element}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
