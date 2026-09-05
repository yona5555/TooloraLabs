import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { TriangleResult as Result } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import TriangleDiagram from "./TriangleDiagram";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

export default function TriangleResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.triangle-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 3 });

  if (!result.valid) {
    const messageKey =
      result.error === "triangle-inequality-violated"
        ? "triangleInequalityViolated"
        : result.error === "angle-sum-invalid"
          ? "angleSumInvalid"
          : result.error === "invalid-angles"
            ? "invalidAngles"
            : "invalidSides";

    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton
          text={`a=${fmt(result.a)}, b=${fmt(result.b)}, c=${fmt(result.c)}, A=${fmt(result.angleA)}°, B=${fmt(result.angleB)}°, C=${fmt(result.angleC)}°`}
          className="!text-white dark:!text-white"
        />
      </div>
      <div className="p-4 lg:p-6">
        <TriangleDiagram result={result} digitStyle={digitStyle} />

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-zinc-100 p-2.5 dark:border-zinc-800">
            <p className="text-base font-bold text-blue-600 dark:text-blue-400">{fmt(result.a)}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("sideA")}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-2.5 dark:border-zinc-800">
            <p className="text-base font-bold text-blue-600 dark:text-blue-400">{fmt(result.b)}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("sideB")}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-2.5 dark:border-zinc-800">
            <p className="text-base font-bold text-blue-600 dark:text-blue-400">{fmt(result.c)}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("sideC")}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-2.5 dark:border-zinc-800">
            <p className="text-base font-bold text-blue-600 dark:text-blue-400">{fmt(result.angleA)}°</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("angleA")}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-2.5 dark:border-zinc-800">
            <p className="text-base font-bold text-blue-600 dark:text-blue-400">{fmt(result.angleB)}°</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("angleB")}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-2.5 dark:border-zinc-800">
            <p className="text-base font-bold text-blue-600 dark:text-blue-400">{fmt(result.angleC)}°</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("angleC")}</p>
          </div>
        </div>

        <ul className="mt-5 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("area")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.area)}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("perimeter")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.perimeter)}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
