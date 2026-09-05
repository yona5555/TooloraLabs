"use client";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";

type MatrixInputPanelProps = {
  a11: string;
  onA11Change: (value: string) => void;
  a12: string;
  onA12Change: (value: string) => void;
  a21: string;
  onA21Change: (value: string) => void;
  a22: string;
  onA22Change: (value: string) => void;
  b11: string;
  onB11Change: (value: string) => void;
  b12: string;
  onB12Change: (value: string) => void;
  b21: string;
  onB21Change: (value: string) => void;
  b22: string;
  onB22Change: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function MatrixInputPanel({
  a11,
  onA11Change,
  a12,
  onA12Change,
  a21,
  onA21Change,
  a22,
  onA22Change,
  b11,
  onB11Change,
  b12,
  onB12Change,
  b21,
  onB21Change,
  b22,
  onB22Change,
  onCalculate,
  onClear,
}: MatrixInputPanelProps) {
  const t = useTranslations("tools.matrix-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <form onSubmit={onCalculate} className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("matrixALabel")}</p>
          <div dir="ltr" className="grid grid-cols-2 gap-3">
            <ToolInput label="a₁₁" type="text" inputMode="decimal" value={a11} onChange={(e) => onA11Change(e.target.value)} />
            <ToolInput label="a₁₂" type="text" inputMode="decimal" value={a12} onChange={(e) => onA12Change(e.target.value)} />
            <ToolInput label="a₂₁" type="text" inputMode="decimal" value={a21} onChange={(e) => onA21Change(e.target.value)} />
            <ToolInput label="a₂₂" type="text" inputMode="decimal" value={a22} onChange={(e) => onA22Change(e.target.value)} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("matrixBLabel")}</p>
          <div dir="ltr" className="grid grid-cols-2 gap-3">
            <ToolInput label="b₁₁" type="text" inputMode="decimal" value={b11} onChange={(e) => onB11Change(e.target.value)} />
            <ToolInput label="b₁₂" type="text" inputMode="decimal" value={b12} onChange={(e) => onB12Change(e.target.value)} />
            <ToolInput label="b₂₁" type="text" inputMode="decimal" value={b21} onChange={(e) => onB21Change(e.target.value)} />
            <ToolInput label="b₂₂" type="text" inputMode="decimal" value={b22} onChange={(e) => onB22Change(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
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
