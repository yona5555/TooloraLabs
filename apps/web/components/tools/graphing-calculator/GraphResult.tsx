import { useTranslations } from "next-intl";
import GraphCanvas from "./GraphCanvas";
import type { GraphResult as Result } from "./types";

type Props = {
  result: Result;
  xMin: number;
  xMax: number;
};

export default function GraphResult({ result, xMin, xMax }: Props) {
  const t = useTranslations("tools.graphing-calculator.result");

  if (result.error) {
    const messageKey = result.error === "invalid-expression" ? "invalidExpression" : "invalidRange";
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

  if (result.yMin === null || result.yMax === null) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("noValidPoints")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
      </div>
      <div className="p-4 lg:p-6">
        <GraphCanvas points={result.points} xMin={xMin} xMax={xMax} yMin={result.yMin} yMax={result.yMax} />
      </div>
    </div>
  );
}
