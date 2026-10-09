"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue, NAMED_MAGNITUDES } from "@tooloralabs/tools";

/** Every named magnitude the engine recognizes (thousand..quadrillion, thousandth..trillionth),
 * as a real ladder -- click a rung to jump the live exponent straight to it. */
export default function NamedMagnitudesLadderCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.namedMagnitudesLadder");
  const { dims, setDim } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const exponentA = Math.round(derivedA.exponent);

  function jumpTo(exponent: number) {
    if (dims.operation === "toScientific") {
      setDim("standardValue", Math.round(derivedA.coefficient * 10 ** exponent * 100) / 100);
    } else {
      setDim("exponentA", exponent);
    }
  }

  return (
    <GlassIndicatorCard
      n={4}
      accent="cyan"
      title={t("title")}
      subtitle={t("subtitle", { exponent: exponentA })}
      visual={
        <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
          {NAMED_MAGNITUDES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => jumpTo(m.exponent)}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-1 text-xs font-semibold transition"
              style={{ background: m.exponent === exponentA ? "#EAF8FD" : "transparent", color: m.exponent === exponentA ? "#1480A3" : undefined }}
            >
              <span>{t(`names.${m.key}`)}</span>
              <span className="font-mono text-zinc-400">10^{m.exponent}</span>
            </button>
          ))}
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("currentExponent"), v: formatSciValue(exponentA) },
            { k: t("nearestName"), v: t(`names.${NAMED_MAGNITUDES.reduce((best, m) => (Math.abs(m.exponent - exponentA) < Math.abs(best.exponent - exponentA) ? m : best)).key}`) },
          ]}
        />
      }
    />
  );
}
