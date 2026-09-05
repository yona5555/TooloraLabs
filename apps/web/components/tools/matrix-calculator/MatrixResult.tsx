"use client";
import { Calculator } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import MatrixTransformDiagram from "./MatrixTransformDiagram";
import MatrixShareExportModal from "./MatrixShareExportModal";
import type { MatrixResult as Result } from "./types";

type Matrices = { a11: number; a12: number; a21: number; a22: number; b11: number; b12: number; b21: number; b22: number };

type Props = {
  result: Result;
  digitStyle: DigitStyle;
  matrices: Matrices;
  hasCalculated: boolean;
};

function Matrix2x2({
  m11,
  m12,
  m21,
  m22,
  fmt,
}: {
  m11: number | null;
  m12: number | null;
  m21: number | null;
  m22: number | null;
  fmt: (v: number) => string;
}) {
  const cell = (v: number | null) => (v === null ? "—" : fmt(v));
  return (
    <div dir="ltr" className="inline-grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg border border-zinc-200 px-3 py-2 font-mono text-sm dark:border-zinc-700">
      <span>{cell(m11)}</span>
      <span>{cell(m12)}</span>
      <span>{cell(m21)}</span>
      <span>{cell(m22)}</span>
    </div>
  );
}

export default function MatrixResult({ result, digitStyle, matrices, hasCalculated }: Props) {
  const t = useTranslations("tools.matrix-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  if (!hasCalculated) {
    return (
      <SectionCard title={t("heading")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title={t("heading")} action={<MatrixShareExportModal result={result} digitStyle={digitStyle} matrices={matrices} />}>
        {result.error === "singular-matrix-a" && <p className="mb-3 text-center text-sm text-amber-600 dark:text-amber-400">{t("singularMatrixA")}</p>}

        <MatrixTransformDiagram
          a11={matrices.a11}
          a12={matrices.a12}
          a21={matrices.a21}
          a22={matrices.a22}
          color="text-blue-600 dark:text-blue-400"
          label={t("diagramA")}
          caption={t("diagramTransformCaption")}
        />

        <div className="grid grid-cols-1 gap-4 border-t border-zinc-200 pt-4 sm:grid-cols-2 dark:border-zinc-800">
          <Field label={t("sum")}>
            <Matrix2x2 m11={result.sum11} m12={result.sum12} m21={result.sum21} m22={result.sum22} fmt={fmt} />
          </Field>
          <Field label={t("difference")}>
            <Matrix2x2 m11={result.diff11} m12={result.diff12} m21={result.diff21} m22={result.diff22} fmt={fmt} />
          </Field>
          <Field label={t("product")}>
            <Matrix2x2 m11={result.product11} m12={result.product12} m21={result.product21} m22={result.product22} fmt={fmt} />
          </Field>
          <Field label={t("transposeA")}>
            <Matrix2x2 m11={result.transposeA11} m12={result.transposeA12} m21={result.transposeA21} m22={result.transposeA22} fmt={fmt} />
          </Field>
          <Field label={t("inverseA")}>
            <Matrix2x2 m11={result.inverseA11} m12={result.inverseA12} m21={result.inverseA21} m22={result.inverseA22} fmt={fmt} />
          </Field>
        </div>

        <dl dir="ltr" className="mt-2 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
          <Stat label={t("determinantA")} value={fmt(result.determinantA)} />
          <Stat label={t("determinantB")} value={fmt(result.determinantB)} />
        </dl>
      </SectionCard>

      <SectionCard title={t("diagramBTitle")}>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("diagramBIntro")}</p>
        <MatrixTransformDiagram
          a11={matrices.b11}
          a12={matrices.b12}
          a21={matrices.b21}
          a22={matrices.b22}
          color="text-orange-500 dark:text-orange-400"
          label={t("diagramB")}
          caption={t("diagramBCaption")}
        />
      </SectionCard>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{value}</dd>
    </div>
  );
}
