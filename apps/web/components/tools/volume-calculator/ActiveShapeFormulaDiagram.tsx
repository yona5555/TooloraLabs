"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useVolumeLive } from "./VolumeLiveContext";
import { parseVolumeDims, computeVolumeFor, round } from "./volumeEducationMath";

type Chip = { label: string; value: string };

function chipsFor(shape: ReturnType<typeof parseVolumeDims>["shape"], n: ReturnType<typeof parseVolumeDims>): { prefix: string; chips: Chip[]; joiner: string } {
  switch (shape) {
    case "cube":
      return { prefix: "", chips: [{ label: "s", value: `${round(n.side ?? 0)}` }, { label: "s", value: `${round(n.side ?? 0)}` }, { label: "s", value: `${round(n.side ?? 0)}` }], joiner: "×" };
    case "rectangular-prism":
      return { prefix: "", chips: [{ label: "l", value: `${round(n.length ?? 0)}` }, { label: "w", value: `${round(n.width ?? 0)}` }, { label: "h", value: `${round(n.height ?? 0)}` }], joiner: "×" };
    case "sphere":
      return { prefix: "(4/3)π ×", chips: [{ label: "r", value: `${round(n.radius ?? 0)}` }, { label: "r", value: `${round(n.radius ?? 0)}` }, { label: "r", value: `${round(n.radius ?? 0)}` }], joiner: "×" };
    case "cylinder":
      return { prefix: "π ×", chips: [{ label: "r²", value: `${round((n.radius ?? 0) ** 2)}` }, { label: "h", value: `${round(n.height ?? 0)}` }], joiner: "×" };
    case "cone":
      return { prefix: "(1/3)π ×", chips: [{ label: "r²", value: `${round((n.radius ?? 0) ** 2)}` }, { label: "h", value: `${round(n.height ?? 0)}` }], joiner: "×" };
    case "square-pyramid":
      return { prefix: "(1/3) ×", chips: [{ label: "b²", value: `${round((n.baseSide ?? 0) ** 2)}` }, { label: "h", value: `${round(n.height ?? 0)}` }], joiner: "×" };
  }
}

/** Type #18 (Formula Diagram): the live active solid's own real volume formula, with its actual current dimensions substituted directly into each box. */
export default function ActiveShapeFormulaDiagram() {
  const t = useTranslations("tools.volume-calculator.education.formulaDiagram");
  const tShape = useTranslations("tools.volume-calculator.form");
  const { dims } = useVolumeLive();
  const n = parseVolumeDims(dims);
  const volume = computeVolumeFor(n);
  const spec = chipsFor(dims.shape, n);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { shape: tShape(`shape.${dims.shape}`) })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 flex-wrap items-center justify-center gap-2 text-center">
          {spec.prefix && <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{spec.prefix}</span>}
          {spec.chips.map((c, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-lg font-bold text-zinc-400">{spec.joiner}</span>}
              <span className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
                <span className="block text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">{c.label}</span>
                <span className="block font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{c.value}</span>
              </span>
            </span>
          ))}
          <span className="text-lg font-bold text-zinc-400">=</span>
          <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <span className="block text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">{t("volumeLabel")}</span>
            <span className="block font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{round(volume)}</span>
          </span>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.shape"), value: tShape(`shape.${dims.shape}`) },
            { label: t("worked.volume"), value: `${round(volume)}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
