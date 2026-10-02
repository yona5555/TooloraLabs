"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useAreaLive } from "./AreaLiveContext";
import { parseAreaDims, computeAreaFor, round } from "./areaEducationMath";

type Chip = { label: string; value: string };

function chipsFor(shape: ReturnType<typeof parseAreaDims>["shape"], n: ReturnType<typeof parseAreaDims>): { prefix: string; chips: Chip[]; joiner: string } {
  switch (shape) {
    case "square":
      return { prefix: "", chips: [{ label: "s", value: `${round(n.side ?? 0)}` }, { label: "s", value: `${round(n.side ?? 0)}` }], joiner: "×" };
    case "rectangle":
      return { prefix: "", chips: [{ label: "w", value: `${round(n.width ?? 0)}` }, { label: "h", value: `${round(n.height ?? 0)}` }], joiner: "×" };
    case "triangle":
      return { prefix: "½ ×", chips: [{ label: "b", value: `${round(n.base ?? 0)}` }, { label: "h", value: `${round(n.height ?? 0)}` }], joiner: "×" };
    case "parallelogram":
      return { prefix: "", chips: [{ label: "b", value: `${round(n.base ?? 0)}` }, { label: "h", value: `${round(n.height ?? 0)}` }], joiner: "×" };
    case "circle":
      return { prefix: "π ×", chips: [{ label: "r", value: `${round(n.radius ?? 0)}` }, { label: "r", value: `${round(n.radius ?? 0)}` }], joiner: "×" };
    case "ellipse":
      return { prefix: "π ×", chips: [{ label: "a", value: `${round(n.semiMajorAxis ?? 0)}` }, { label: "b", value: `${round(n.semiMinorAxis ?? 0)}` }], joiner: "×" };
    case "trapezoid":
      return { prefix: "½ ×", chips: [{ label: "(b₁+b₂)", value: `${round((n.base1 ?? 0) + (n.base2 ?? 0))}` }, { label: "h", value: `${round(n.height ?? 0)}` }], joiner: "×" };
    case "sector":
      return { prefix: "(θ/360) × π ×", chips: [{ label: "r", value: `${round(n.radius ?? 0)}` }, { label: "r", value: `${round(n.radius ?? 0)}` }], joiner: "×" };
  }
}

/** Type #18 (Formula Diagram): the live dataset's own active shape formula, with its real current dimensions substituted directly into each box. */
export default function ActiveShapeFormulaDiagram() {
  const t = useTranslations("tools.area-calculator.education.formulaDiagram");
  const tShape = useTranslations("tools.area-calculator.form");
  const { dims } = useAreaLive();
  const n = parseAreaDims(dims);
  const area = computeAreaFor(n);
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
            <span className="block text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">{t("areaLabel")}</span>
            <span className="block font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{round(area)}</span>
          </span>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.shape"), value: tShape(`shape.${dims.shape}`) },
            { label: t("worked.area"), value: `${round(area)}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
