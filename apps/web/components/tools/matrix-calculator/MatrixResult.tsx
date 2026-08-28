import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { MatrixResult as Result } from "./types";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
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

export default function MatrixResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.matrix-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  const copyText = `${t("determinantA")}: ${fmt(result.determinantA)}, ${t("determinantB")}: ${fmt(result.determinantB)}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="flex flex-col gap-4 p-4 lg:p-6">
          {result.error === "singular-matrix-a" && (
            <p className="text-center text-sm text-amber-600 dark:text-amber-400">{t("singularMatrixA")}</p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <dl dir="ltr" className="grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
            <Stat label={t("determinantA")} value={fmt(result.determinantA)} />
            <Stat label={t("determinantB")} value={fmt(result.determinantB)} />
          </dl>
        </div>
      </div>
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
