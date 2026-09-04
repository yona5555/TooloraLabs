"use client";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { MathSolverMode, FractionOperator } from "@tooloralabs/tools";
import { emptyMathSolverDraft, emptyTerm, type MathSolverDraft } from "./types";

const MODES: MathSolverMode[] = ["linear-equation", "quadratic-equation", "fraction-operation", "derivative"];
const FRACTION_OPS: FractionOperator[] = ["add", "subtract", "multiply", "divide"];

type Props = {
  draft: MathSolverDraft;
  onChange: (draft: MathSolverDraft) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function MathSolverInputPanel({ draft, onChange, onCalculate, onClear }: Props) {
  const t = useTranslations("tools.step-by-step-math-solver.form");

  function patch(partial: Partial<MathSolverDraft>) {
    onChange({ ...draft, ...partial });
  }

  const field = (key: "linearA" | "linearB" | "linearC" | "linearD" | "quadA" | "quadB" | "quadC" | "fracA" | "fracB" | "fracC" | "fracD", label: string, hint?: string) => (
    <ToolInput label={label} hint={hint} type="text" inputMode="decimal" value={draft[key]} onChange={(e) => patch({ [key]: e.target.value } as Partial<MathSolverDraft>)} />
  );

  function loadExample() {
    const example = emptyMathSolverDraft();
    if (draft.mode === "linear-equation") {
      patch({ linearA: example.linearA, linearB: example.linearB, linearC: example.linearC, linearD: example.linearD });
    } else if (draft.mode === "quadratic-equation") {
      patch({ quadA: example.quadA, quadB: example.quadB, quadC: example.quadC });
    } else if (draft.mode === "fraction-operation") {
      patch({ fracA: example.fracA, fracB: example.fracB, fracOp: example.fracOp, fracC: example.fracC, fracD: example.fracD });
    } else {
      patch({ polynomialTerms: example.polynomialTerms });
    }
  }

  function updateTerm(index: number, partial: Partial<{ coefficient: string; power: string }>) {
    patch({ polynomialTerms: draft.polynomialTerms.map((term, i) => (i === index ? { ...term, ...partial } : term)) });
  }
  function addTerm() {
    patch({ polynomialTerms: [...draft.polynomialTerms, emptyTerm()] });
  }
  function removeTerm(index: number) {
    patch({ polynomialTerms: draft.polynomialTerms.length > 1 ? draft.polynomialTerms.filter((_, i) => i !== index) : draft.polynomialTerms });
  }

  return (
    <SectionCard title={t("inputTitle")}>
      <form onSubmit={onCalculate}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("modeLabel")}</span>
        <select
          value={draft.mode}
          onChange={(e) => patch({ mode: e.target.value as MathSolverMode })}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          {MODES.map((mode) => (
            <option key={mode} value={mode}>
              {t(`mode.${mode}`)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={loadExample}
        className="mt-3 w-full rounded-xl border border-dashed border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {t("loadExample")}
      </button>

      <div className="mt-5 space-y-5">
        {draft.mode === "linear-equation" && (
          <>
            <p dir="ltr" className="text-center text-sm font-mono text-zinc-500 dark:text-zinc-400">
              ax + b = cx + d
            </p>
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint.linear")}</p>
            <div className="grid grid-cols-2 gap-3">
              {field("linearA", "a")}
              {field("linearB", "b")}
              {field("linearC", "c")}
              {field("linearD", "d")}
            </div>
          </>
        )}

        {draft.mode === "quadratic-equation" && (
          <>
            <p dir="ltr" className="text-center text-sm font-mono text-zinc-500 dark:text-zinc-400">
              ax² + bx + c = 0
            </p>
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint.quadratic")}</p>
            <div className="grid grid-cols-3 gap-3">
              {field("quadA", "a")}
              {field("quadB", "b")}
              {field("quadC", "c")}
            </div>
          </>
        )}

        {draft.mode === "fraction-operation" && (
          <>
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint.fraction")}</p>
            <div className="grid grid-cols-2 gap-3">
              {field("fracA", t("numeratorLabel"))}
              {field("fracB", t("denominatorLabel"))}
            </div>
            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("operationLabel")}</span>
              <select
                value={draft.fracOp}
                onChange={(e) => patch({ fracOp: e.target.value as FractionOperator })}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
              >
                {FRACTION_OPS.map((op) => (
                  <option key={op} value={op}>
                    {t(`fracOp.${op}`)}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {field("fracC", t("numeratorLabel"))}
              {field("fracD", t("denominatorLabel"))}
            </div>
          </>
        )}

        {draft.mode === "derivative" && (
          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("termsLabel")}</p>
            <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">{t("hint.derivative")}</p>
            <div className="space-y-3">
              {draft.polynomialTerms.map((term, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1">
                    <ToolInput
                      label={t("coefficientLabel")}
                      type="text"
                      inputMode="decimal"
                      value={term.coefficient}
                      onChange={(e) => updateTerm(index, { coefficient: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <ToolInput
                      label={t("powerLabel")}
                      type="text"
                      inputMode="decimal"
                      value={term.power}
                      onChange={(e) => updateTerm(index, { power: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTerm(index)}
                    aria-label={t("removeTerm")}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTerm}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Plus size={16} />
                {t("addTerm")}
              </button>
            </div>
          </div>
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
