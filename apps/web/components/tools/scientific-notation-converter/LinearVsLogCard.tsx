"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue, standardValueOf } from "@tooloralabs/tools";

const LINEAR_MAX = 1000;

/** The same value on two bars: a linear scale (where huge numbers vanish off the right edge) and
 * a log scale (where they stay readable) -- drag the log bar's handle to set a new exponent. */
export default function LinearVsLogCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.linearVsLog");
  const { dims, setDim } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const standard = Math.abs(standardValueOf(derivedA.coefficient, derivedA.exponent));
  const linearFrac = Math.max(0, Math.min(1, standard / LINEAR_MAX));
  const logFrac = Math.max(0, Math.min(1, (derivedA.exponent + 15) / 30));

  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const exponent = Math.round(f * 30 - 15);
    if (dims.operation === "toScientific") {
      setDim("standardValue", Math.round(derivedA.coefficient * 10 ** exponent * 100) / 100);
    } else {
      setDim("exponentA", exponent);
    }
  }

  return (
    <GlassIndicatorCard
      n={5}
      accent="mint"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div className="flex w-56 flex-col gap-3">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400">{t("linearLabel")}</p>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="h-full rounded-full bg-zinc-400" style={{ width: `${linearFrac * 100}%` }} />
            </div>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400">{t("logLabel")}</p>
            <div
              className="relative h-6 touch-none rounded-full bg-emerald-100 dark:bg-emerald-900/30"
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); }}
              onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}
            >
              <div className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1FC89C] ring-2 ring-white dark:ring-zinc-900" style={{ left: `${logFrac * 100}%` }} />
            </div>
          </div>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("standardValue"), v: formatSciValue(standard) },
            { k: t("linearPosition"), v: standard > LINEAR_MAX ? t("offScale") : `${formatSciValue(linearFrac * 100)}%` },
            { k: t("logExponent"), v: formatSciValue(Math.round(derivedA.exponent)) },
          ]}
        />
      }
    />
  );
}
