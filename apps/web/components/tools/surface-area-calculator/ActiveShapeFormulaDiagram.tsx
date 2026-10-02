"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSurfaceAreaLive } from "./SurfaceAreaLiveContext";
import { parseSurfaceDims, computeSurfaceAreaFor, slantHeightOf, round } from "./surfaceAreaEducationMath";

type Chip = { label: string; value: string };

function chipsFor(shape: ReturnType<typeof parseSurfaceDims>["shape"], n: ReturnType<typeof parseSurfaceDims>): { prefix: string; chips: Chip[]; joiner: string } {
  switch (shape) {
    case "cube":
      return { prefix: "6 ×", chips: [{ label: "s", value: `${round(n.side ?? 0)}` }, { label: "s", value: `${round(n.side ?? 0)}` }], joiner: "×" };
    case "rectangular-prism":
      return { prefix: "2 ×", chips: [{ label: "(lw+lh+wh)", value: `${round((n.length ?? 0) * (n.width ?? 0) + (n.length ?? 0) * (n.height ?? 0) + (n.width ?? 0) * (n.height ?? 0))}` }], joiner: "" };
    case "sphere":
      return { prefix: "4π ×", chips: [{ label: "r", value: `${round(n.radius ?? 0)}` }, { label: "r", value: `${round(n.radius ?? 0)}` }], joiner: "×" };
    case "cylinder":
      return { prefix: "2πr ×", chips: [{ label: "(r+h)", value: `${round((n.radius ?? 0) + (n.height ?? 0))}` }], joiner: "" };
    case "cone": {
      const slant = slantHeightOf(n) ?? 0;
      return { prefix: "πr ×", chips: [{ label: "(r+slant)", value: `${round((n.radius ?? 0) + slant)}` }], joiner: "" };
    }
    case "square-pyramid": {
      const slant = slantHeightOf(n) ?? 0;
      return { prefix: "b² + 2b ×", chips: [{ label: "slant", value: `${round(slant)}` }], joiner: "" };
    }
  }
}

/** Type #18 (Formula Diagram): the live active solid's own real surface-area formula, with its actual current dimensions substituted directly into each box. */
export default function ActiveShapeFormulaDiagram() {
  const t = useTranslations("tools.surface-area-calculator.education.formulaDiagram");
  const tShape = useTranslations("tools.surface-area-calculator.form");
  const { dims } = useSurfaceAreaLive();
  const n = parseSurfaceDims(dims);
  const total = computeSurfaceAreaFor(n);
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
            <span className="block text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">{t("totalLabel")}</span>
            <span className="block font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{round(total)}</span>
          </span>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.shape"), value: tShape(`shape.${dims.shape}`) },
            { label: t("worked.total"), value: `${round(total)}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
