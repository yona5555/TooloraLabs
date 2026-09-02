"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { AreaShape } from "@tooloralabs/tools";
import type { AreaDraft } from "./types";

const SHAPES: AreaShape[] = ["square", "rectangle", "triangle", "circle", "ellipse", "trapezoid", "parallelogram", "sector"];

type Props = {
  draft: AreaDraft;
  onChange: (draft: AreaDraft) => void;
};

export default function AreaInputPanel({ draft, onChange }: Props) {
  const t = useTranslations("tools.area-calculator.form");

  function patch(partial: Partial<AreaDraft>) {
    onChange({ ...draft, ...partial });
  }

  const field = (key: keyof AreaDraft, label: string) => (
    <ToolInput label={label} type="text" inputMode="decimal" value={draft[key]} onChange={(e) => patch({ [key]: e.target.value } as Partial<AreaDraft>)} />
  );

  return (
    <SectionCard title={t("inputTitle")}>
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
        {draft.shape === "square" && field("side", t("sideLabel"))}

        {draft.shape === "rectangle" && (
          <>
            {field("width", t("widthLabel"))}
            {field("height", t("heightLabel"))}
          </>
        )}

        {(draft.shape === "triangle" || draft.shape === "parallelogram") && (
          <>
            {field("base", t("baseLabel"))}
            {field("height", t("heightLabel"))}
          </>
        )}

        {draft.shape === "circle" && field("radius", t("radiusLabel"))}

        {draft.shape === "ellipse" && (
          <>
            {field("semiMajorAxis", t("semiMajorAxisLabel"))}
            {field("semiMinorAxis", t("semiMinorAxisLabel"))}
          </>
        )}

        {draft.shape === "trapezoid" && (
          <>
            {field("base1", t("base1Label"))}
            {field("base2", t("base2Label"))}
            {field("height", t("heightLabel"))}
          </>
        )}

        {draft.shape === "sector" && (
          <>
            {field("radius", t("radiusLabel"))}
            {field("angleDegrees", t("angleLabel"))}
          </>
        )}
      </div>
    </SectionCard>
  );
}
