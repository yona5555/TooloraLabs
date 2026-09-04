import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CircleKnownField, CircleResult as Result } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import CircleDiagram from "./CircleDiagram";

type Props = {
  result: Result;
  knownField: CircleKnownField;
  digitStyle: DigitStyle;
};

export default function CircleResult({ result, knownField, digitStyle }: Props) {
  const t = useTranslations("tools.circle-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  if (result.error) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("invalidValue")}</p>
        </div>
      </div>
    );
  }

  const fields: { key: CircleKnownField; value: number }[] = [
    { key: "radius", value: result.radius },
    { key: "diameter", value: result.diameter },
    { key: "circumference", value: result.circumference },
    { key: "area", value: result.area },
  ];

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton
          text={fields.map((f) => `${t(`fields.${f.key}`)}: ${fmt(f.value)}`).join(", ")}
          className="!text-white dark:!text-white"
        />
      </div>
      <div className="p-4 lg:p-6">
        <CircleDiagram radius={result.radius} digitStyle={digitStyle} />

        <div className="mt-5 grid grid-cols-2 gap-3">
          {fields.map((f) => (
            <div
              key={f.key}
              className={`rounded-xl border p-3 text-center ${
                f.key === knownField ? "border-blue-400 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10" : "border-zinc-100 dark:border-zinc-800"
              }`}
            >
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{fmt(f.value)}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t(`fields.${f.key}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
