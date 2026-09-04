"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { AreaShape } from "@tooloralabs/tools";
import type { AreaDraft } from "./types";
import type { FormEvent } from "react";

const SHAPES: AreaShape[] = ["square", "rectangle", "triangle", "circle", "ellipse", "trapezoid", "parallelogram", "sector"];

type Props = {
  draft: AreaDraft;
  onChange: (draft: AreaDraft) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function AreaInputPanel({ draft, onChange, onCalculate, onClear }: Props) {
  const t = useTranslations("tools.area-calculator.form");

  function patch(partial: Partial<AreaDraft>) {
    onChange({ ...draft, ...partial });
  }

  const field = (key: keyof AreaDraft, label: string, hint?: string) => (
    <ToolInput
      label={label}
      hint={hint}
      type="text"
      inputMode="decimal"
      value={draft[key]}
      onChange={(e) => patch({ [key]: e.target.value } as Partial<AreaDraft>)}
    />
  );

  return (
    <SectionCard title={t("inputTitle")}>
      <form onSubmit={onCalculate}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("shapeLabel")}</span>
        <select
          value={draft.shape}
          onChange={(e) => patch({ shape: e.target.value as AreaShape })}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          {SHAPES.map((shape) => (
            <option key={shape} value={shape}>
              {t(`shape.${shape}`)}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-5 space-y-5">
        {draft.shape === "square" && field("side", t("sideLabel"), t("hint.side"))}

        {draft.shape === "rectangle" && (
          <>
            {field("width", t("widthLabel"), t("hint.rectangleWidth"))}
            {field("height", t("heightLabel"), t("hint.rectangleHeight"))}
          </>
        )}

        {draft.shape === "triangle" && (
          <>
            {field("base", t("baseLabel"), t("hint.triangleBase"))}
            {field("height", t("heightLabel"), t("hint.triangleHeight"))}
          </>
        )}

        {draft.shape === "parallelogram" && (
          <>
            {field("base", t("baseLabel"), t("hint.triangleBase"))}
            {field("height", t("heightLabel"), t("hint.triangleHeight"))}
          </>
        )}

        {draft.shape === "circle" && field("radius", t("radiusLabel"), t("hint.circleRadius"))}

        {draft.shape === "ellipse" && (
          <>
            {field("semiMajorAxis", t("semiMajorAxisLabel"), t("hint.ellipseMajor"))}
            {field("semiMinorAxis", t("semiMinorAxisLabel"), t("hint.ellipseMinor"))}
          </>
        )}

        {draft.shape === "trapezoid" && (
          <>
            {field("base1", t("base1Label"), t("hint.trapezoidBase1"))}
            {field("base2", t("base2Label"), t("hint.trapezoidBase2"))}
            {field("height", t("heightLabel"), t("hint.triangleHeight"))}
          </>
        )}

        {draft.shape === "sector" && (
          <>
            {field("radius", t("radiusLabel"), t("hint.circleRadius"))}
            {field("angleDegrees", t("angleLabel"), t("hint.sectorAngle"))}
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <ToolButton type="submit">{t("calculate")}</ToolButton>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {t("clear")}
        </button>
      </div>
      </form>
    </SectionCard>
  );
}
