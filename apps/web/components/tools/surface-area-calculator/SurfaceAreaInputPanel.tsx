"use client";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { Solid3DShape } from "@tooloralabs/tools";
import type { Solid3DDraft } from "./types";

const SHAPES: Solid3DShape[] = ["cube", "rectangular-prism", "sphere", "cylinder", "cone", "square-pyramid"];

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

  const field = (key: keyof Solid3DDraft, label: string, hint?: string) => (
    <ToolInput
      label={label}
      hint={hint}
      type="text"
      inputMode="decimal"
      value={draft[key]}
      onChange={(e) => patch({ [key]: e.target.value } as Partial<Solid3DDraft>)}
    />
  );

  return (
    <SectionCard title={t("inputTitle")}>
      <form onSubmit={onCalculate}>
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("shapeLabel")}</span>
          <select
            value={draft.shape}
            onChange={(e) => patch({ shape: e.target.value as Solid3DShape })}
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
          {draft.shape === "cube" && field("side", t("sideLabel"), t("hint.cubeSide"))}

          {draft.shape === "rectangular-prism" && (
            <>
              {field("length", t("lengthLabel"), t("hint.prismLength"))}
              {field("width", t("widthLabel"), t("hint.prismWidth"))}
              {field("height", t("heightLabel"), t("hint.prismHeight"))}
            </>
          )}

          {draft.shape === "sphere" && field("radius", t("radiusLabel"), t("hint.sphereRadius"))}

          {draft.shape === "cylinder" && (
            <>
              {field("radius", t("radiusLabel"), t("hint.cylinderRadius"))}
              {field("height", t("heightLabel"), t("hint.cylinderHeight"))}
            </>
          )}

          {draft.shape === "cone" && (
            <>
              {field("radius", t("radiusLabel"), t("hint.cylinderRadius"))}
              {field("height", t("heightLabel"), t("hint.coneHeight"))}
            </>
          )}

          {draft.shape === "square-pyramid" && (
            <>
              {field("baseSide", t("baseSideLabel"), t("hint.pyramidBaseSide"))}
              {field("height", t("heightLabel"), t("hint.pyramidHeight"))}
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
