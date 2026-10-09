"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue, SI_PREFIXES, nearestSiPrefix } from "@tooloralabs/tools";

/** The real SI prefix scale, yotta down to yocto -- click a wedge to jump the live exponent
 * straight to that prefix. */
export default function SiPrefixWheelCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.siPrefixWheel");
  const { dims, setDim } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const exponentA = Math.round(derivedA.exponent);
  const nearest = nearestSiPrefix(exponentA);

  function jumpTo(exponent: number) {
    if (dims.operation === "toScientific") {
      setDim("standardValue", Math.round(derivedA.coefficient * 10 ** exponent * 100) / 100);
    } else {
      setDim("exponentA", exponent);
    }
  }

  const n = SI_PREFIXES.length;
  const r = 50;
  return (
    <GlassIndicatorCard
      n={11}
      accent="pink"
      title={t("title")}
      subtitle={t("subtitle", { symbol: nearest.symbol || "—", name: t(`prefixNames.${nearest.name}`) })}
      visual={
        <svg width={120} height={120} viewBox="0 0 120 120">
          {SI_PREFIXES.map((p, i) => {
            const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
            const x = 60 + r * Math.cos(angle);
            const y = 60 + r * Math.sin(angle);
            const active = p.exponent === nearest.exponent;
            return (
              <g key={p.symbol || "base"} onClick={() => jumpTo(p.exponent)} className="cursor-pointer">
                <circle cx={x} cy={y} r={active ? 10 : 7} fill={active ? "#F0507A" : "#FDEEF2"} stroke="#F0507A" strokeWidth={active ? 0 : 1} />
                <text x={x} y={y + 3} textAnchor="middle" fontSize={active ? 9 : 7} fontWeight="700" fill={active ? "white" : "#C73862"}>
                  {p.symbol || "1"}
                </text>
              </g>
            );
          })}
          <text x="60" y="63" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
            10^{exponentA}
          </text>
        </svg>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("exponent"), v: formatSciValue(exponentA) },
            { k: t("nearestPrefix"), v: `${nearest.symbol || "—"} (${t(`prefixNames.${nearest.name}`)})` },
            { k: t("prefixExponent"), v: formatSciValue(nearest.exponent) },
          ]}
        />
      }
    />
  );
}
