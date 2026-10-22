"use client";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { Solid3DShape } from "@tooloralabs/tools";
import type { Solid3DDraft } from "./types";
import { SHAPE_DEFAULTS } from "./types";

const SHAPES: Solid3DShape[] = ["cube", "rectangular-prism", "sphere", "cylinder", "cone", "square-pyramid"];

type FieldDef = { key: keyof Solid3DDraft; label: string; hint?: string };

function chunkPairs<T>(items: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += 2) out.push(items.slice(i, i + 2));
  return out;
}

type Props = {
  draft: Solid3DDraft;
  onChange: (draft: Solid3DDraft) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function SurfaceAreaInputPanel({ draft, onChange, onCalculate, onClear }: Props) {
  const t = useTranslations("tools.surface-area-calculator.form");

  function patch(partial: Partial<Solid3DDraft>) {
    onChange({ ...draft, ...partial });
  }

  // Phone standard (<768px, 2026-10-22, this tool only): label beside the field in one 47px-tall
  // row (a 96px label column + the field filling the rest) instead of the label stacked above it;
  // `md:` and up restore ToolInput's own normal stacked layout untouched. The hint stays desktop-only
  // (dropped visually at this row height, not from the HTML — see `hint` below) since there's no
  // room for a third line at 47px.
  const field = (key: keyof Solid3DDraft, label: string, hint?: string) => (
    <div key={key} className="max-md:grid max-md:h-[47px] max-md:grid-cols-[96px_1fr] max-md:items-center max-md:gap-3 max-md:border-b max-md:border-zinc-100 max-md:last:border-b-0 dark:max-md:border-zinc-800">
      <span className="max-md:text-end max-md:text-[13px] max-md:font-semibold max-md:text-zinc-600 max-md:dark:text-zinc-300 md:hidden" aria-hidden="true">
        {label}
      </span>
      <ToolInput
        label={label}
        hint={hint}
        type="text"
        inputMode="decimal"
        value={draft[key]}
        onChange={(e) => patch({ [key]: e.target.value } as Partial<Solid3DDraft>)}
        className="max-md:h-[34px] max-md:py-0 max-md:text-base"
        labelClassName="max-md:hidden"
        hintClassName="max-md:hidden"
        wrapperClassName="max-md:space-y-0"
      />
    </div>
  );

  // Phone standard (<768px, owner-approved 2026-10-23, this tool only): a shape with 2+ fields
  // fits two per 44px row (label stacked above a compact input) instead of one 47px row per
  // field; `md:contents` on the row wrapper removes it from the layout at `md` and up, so each
  // field becomes a direct child of the `space-y-5` column there — identical to `field()`'s own
  // markup, restoring today's one-full-row-per-field desktop layout untouched. A shape with an odd
  // field count keeps its last field in the full-width `field()` row (unchanged) instead of a
  // half-empty pair.
  const fieldHalf = (key: keyof Solid3DDraft, label: string, hint?: string) => (
    <div key={key} className="max-md:flex max-md:h-[44px] max-md:flex-col max-md:justify-center max-md:gap-0.5">
      <span className="max-md:text-[10px] max-md:font-semibold max-md:text-zinc-500 md:hidden dark:max-md:text-zinc-400" aria-hidden="true">
        {label}
      </span>
      <ToolInput
        label={label}
        hint={hint}
        type="text"
        inputMode="decimal"
        value={draft[key]}
        onChange={(e) => patch({ [key]: e.target.value } as Partial<Solid3DDraft>)}
        className="max-md:h-[22px] max-md:py-0 max-md:text-sm"
        labelClassName="max-md:hidden"
        hintClassName="max-md:hidden"
        wrapperClassName="max-md:space-y-0"
      />
    </div>
  );

  const fieldDefs: FieldDef[] =
    draft.shape === "cube"
      ? [{ key: "side", label: t("sideLabel"), hint: t("hint.cubeSide") }]
      : draft.shape === "rectangular-prism"
        ? [
            { key: "length", label: t("lengthLabel"), hint: t("hint.prismLength") },
            { key: "width", label: t("widthLabel"), hint: t("hint.prismWidth") },
            { key: "height", label: t("heightLabel"), hint: t("hint.prismHeight") },
          ]
        : draft.shape === "sphere"
          ? [{ key: "radius", label: t("radiusLabel"), hint: t("hint.sphereRadius") }]
          : draft.shape === "cylinder"
            ? [
                { key: "radius", label: t("radiusLabel"), hint: t("hint.cylinderRadius") },
                { key: "height", label: t("heightLabel"), hint: t("hint.cylinderHeight") },
              ]
            : draft.shape === "cone"
              ? [
                  { key: "radius", label: t("radiusLabel"), hint: t("hint.cylinderRadius") },
                  { key: "height", label: t("heightLabel"), hint: t("hint.coneHeight") },
                ]
              : [
                  { key: "baseSide", label: t("baseSideLabel"), hint: t("hint.pyramidBaseSide") },
                  { key: "height", label: t("heightLabel"), hint: t("hint.pyramidHeight") },
                ];

  const pairRow = (a: FieldDef, b: FieldDef) => (
    <div
      key={`${a.key}_${b.key}`}
      className="max-md:grid max-md:h-[44px] max-md:grid-cols-2 max-md:items-center max-md:gap-3 max-md:border-b max-md:border-zinc-100 max-md:last:border-b-0 md:contents dark:max-md:border-zinc-800"
    >
      {fieldHalf(a.key, a.label, a.hint)}
      {fieldHalf(b.key, b.label, b.hint)}
    </div>
  );

  return (
    <SectionCard title={t("inputTitle")} mobilePlain bodyClassName="max-md:p-[11px] md:p-4 lg:p-6">
      <form onSubmit={onCalculate}>
        <div className="max-md:grid max-md:h-[47px] max-md:grid-cols-[96px_1fr] max-md:items-center max-md:gap-3 max-md:border-b max-md:border-zinc-100 dark:max-md:border-zinc-800">
          <span className="max-md:text-end max-md:text-[13px] max-md:font-semibold max-md:text-zinc-600 md:hidden dark:max-md:text-zinc-300">{t("shapeLabel")}</span>
          <label className="block space-y-2 max-md:space-y-0">
            <span className="block text-sm font-semibold text-zinc-700 max-md:hidden dark:text-zinc-300">{t("shapeLabel")}</span>
            <select
              value={draft.shape}
              onChange={(e) => {
                const shape = e.target.value as Solid3DShape;
                patch({ shape, ...SHAPE_DEFAULTS[shape] });
              }}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 max-md:h-[34px] max-md:rounded-lg max-md:px-2 max-md:py-0 max-md:text-base dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            >
              {SHAPES.map((shape) => (
                <option key={shape} value={shape}>
                  {t(`shape.${shape}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 space-y-5 max-md:mt-0 max-md:space-y-0">
          {chunkPairs(fieldDefs).map((chunk) => (chunk.length === 2 ? pairRow(chunk[0], chunk[1]) : field(chunk[0].key, chunk[0].label, chunk[0].hint)))}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 max-md:mt-3 max-md:grid max-md:grid-cols-2 max-md:gap-3">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 max-md:flex max-md:h-11 max-md:items-center max-md:justify-center max-md:px-0"
          >
            {t("calculate")}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 max-md:flex max-md:h-11 max-md:items-center max-md:justify-center max-md:px-0 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("clear")}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
