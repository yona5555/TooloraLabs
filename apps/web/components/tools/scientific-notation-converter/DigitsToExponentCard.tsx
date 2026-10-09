"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue } from "@tooloralabs/tools";

const DIGIT_COUNTS = [1, 2, 3, 4, 6, 8, 10, 12];

/** For a positive integer, exponent = (number of digits) - 1 -- a real, exact relationship, not
 * an approximation. Drag along the line to jump the live exponent to match a chosen digit count. */
export default function DigitsToExponentCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.digitsToExponent");
  const { dims, setDim } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const exponentA = Math.round(derivedA.exponent);
  const digitCount = exponentA >= 0 ? exponentA + 1 : 1;

  function jumpToDigits(digits: number) {
    const exponent = digits - 1;
    if (dims.operation === "toScientific") {
      setDim("standardValue", Math.round(derivedA.coefficient * 10 ** exponent * 100) / 100);
    } else {
      setDim("exponentA", exponent);
    }
  }

  const w = 200;
  const h = 90;
  const toX = (d: number) => 20 + ((d - 1) / 11) * (w - 40);
  const toY = (d: number) => h - 15 - ((d - 1) / 11) * (h - 30);

  return (
    <GlassIndicatorCard
      n={13}
      accent="cyan"
      title={t("title")}
      subtitle={t("subtitle", { digits: digitCount, exponent: exponentA })}
      visual={
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <line x1={toX(1)} y1={toY(1)} x2={toX(12)} y2={toY(12)} stroke="#6AD2F2" strokeWidth={2} />
          {DIGIT_COUNTS.map((d) => (
            <circle key={d} cx={toX(d)} cy={toY(d)} r={d === digitCount ? 5 : 3} fill={d === digitCount ? "#1480A3" : "#9FE0F2"} className="cursor-pointer" onClick={() => jumpToDigits(d)} />
          ))}
        </svg>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("digitCount"), v: formatSciValue(digitCount) },
            { k: t("exponent"), v: formatSciValue(exponentA) },
            { k: t("formula"), v: "exponent = digits − 1" },
          ]}
        />
      }
    />
  );
}
