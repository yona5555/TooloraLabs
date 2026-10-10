"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { SignificantFiguresCalculator, buildDigitTower, plainDecimalString, type RoundingRule } from "@tooloralabs/tools";
import LiveTable3DLayout, { type LiveTableGroup, type LiveTableRow } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";
import type { SigFigTower } from "./SignificantFiguresScene3D";

const SignificantFiguresScene3D = dynamic(() => import("./SignificantFiguresScene3D"), { ssr: false, loading: () => null });

const tool = new SignificantFiguresCalculator();
const OP_SYMBOL = { add: "+", subtract: "−", multiply: "×", divide: "÷" } as const;

/**
 * Significant-figures live table + 3D digit tower (site rule: table left, 3D
 * right). Reads the shared live inputs, so it follows every keystroke in both
 * the Result card and the encyclopedia.
 */
export default function SignificantFiguresLive3D({ camera = [0, 3.6, 7.4] }: { camera?: [number, number, number] }) {
  const t = useTranslations("tools.significant-figures-calculator.live3d");
  const tr = useTranslations("tools.significant-figures-calculator.result");
  const tf = useTranslations("tools.significant-figures-calculator.form");
  const tc = useTranslations("common.live3d");
  const p = usePalette3D();
  const { dims } = useSignificantFiguresLive();
  const { operation, rawValueA, rawValueB, roundToDigits } = dims;

  const model = useMemo(() => {
    const result = tool.execute({ operation, rawValueA, rawValueB, roundToDigits }, { locale: "en-US" }).data;
    const binary = operation !== "count" && operation !== "round";
    const rawStr = binary ? plainDecimalString(result.rawResult) : rawValueA.trim();
    let rule: RoundingRule = null;
    if (operation === "round") rule = { sigFigs: roundToDigits };
    else if (operation === "multiply" || operation === "divide") rule = { sigFigs: result.resultSigFigs ?? 1 };
    else if (operation === "add" || operation === "subtract") rule = { decimalPlaces: result.resultDecimalPlaces ?? 0 };
    const main = buildDigitTower(rawStr, rule);
    const towers: SigFigTower[] = binary
      ? [
          { label: "A", tower: buildDigitTower(rawValueA.trim(), null), isResult: false },
          { label: "B", tower: buildDigitTower(rawValueB.trim(), null), isResult: false },
          { label: "=", tower: main, isResult: true },
        ]
      : [{ label: operation === "round" ? "→" : "A", tower: main, isResult: operation === "round" }];
    return { result, binary, rawStr, main, towers };
  }, [operation, rawValueA, rawValueB, roundToDigits]);

  const { result, binary, rawStr, main, towers } = model;
  if (result.error) return <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{tr(result.error === "divide-by-zero" ? "divideByZero" : "invalidNumber")}</p>;

  const a = rawValueA.trim();
  const b = rawValueB.trim();
  const isAddSub = operation === "add" || operation === "subtract";
  const sf = result.resultSigFigs ?? result.sigFigsA;
  const roundedStr =
    operation === "count" ? a : isAddSub ? result.roundedResult.toFixed(result.resultDecimalPlaces ?? 0) : result.roundedResult.toPrecision(Math.max(1, sf));
  const plainRounded = /e/i.test(roundedStr) ? plainDecimalString(result.roundedResult) : roundedStr;
  const coef = result.resultScientific.coefficient;
  const sciDigits = operation === "count" ? result.sigFigsA : isAddSub ? buildDigitTower(plainRounded, null).significantCount : sf;
  const sci = `${coef.toFixed(Math.min(20, Math.max(0, sciDigits - 1)))} × 10^${result.resultScientific.exponent}`;
  const sigDigits = main.digits.filter((d) => d.role === "significant").map((d) => d.digit);
  const dropped = main.digits.filter((d) => !d.kept).map((d) => d.digit);
  const leading = main.digits.filter((d) => d.role === "leading-zero").length;
  const trailing = main.digits.filter((d) => d.role === "trailing-zero").length;

  const inputRows: LiveTableRow[] = [
    { label: t("operation"), value: tf(`operation.${operation}`) },
    { label: binary ? tf("firstValueLabel") : tf("valueLabel"), formula: "A", value: a },
    { label: `${t("sigFigs")} (A)`, formula: `count(${a})`, value: String(result.sigFigsA) },
    { label: `${t("decimalPlaces")} (A)`, value: String(result.decimalPlacesA) },
  ];
  if (binary) {
    inputRows.push(
      { label: tf("secondValueLabel"), formula: "B", value: b },
      { label: `${t("sigFigs")} (B)`, formula: `count(${b})`, value: String(result.sigFigsB ?? 0) },
      { label: `${t("decimalPlaces")} (B)`, value: String(result.decimalPlacesB ?? 0) }
    );
  }

  let ruleFormula: string;
  let ruleValue: string;
  if (operation === "count") {
    ruleFormula = `${t("sigFigs")}(${a})`;
    ruleValue = String(result.sigFigsA);
  } else if (operation === "round") {
    ruleFormula = `N = ${roundToDigits}`;
    ruleValue = String(roundToDigits);
  } else if (isAddSub) {
    ruleFormula = `min(${result.decimalPlacesA}, ${result.decimalPlacesB ?? 0})`;
    ruleValue = String(result.resultDecimalPlaces ?? 0);
  } else {
    ruleFormula = `min(${result.sigFigsA}, ${result.sigFigsB ?? 0})`;
    ruleValue = String(result.resultSigFigs ?? 0);
  }

  const groups: LiveTableGroup[] = [
    { title: t("groupInput"), rows: inputRows },
    {
      title: t("groupDigits"),
      rows: [
        { label: t("significantDigits"), formula: rawStr, value: sigDigits.join(" ") || "0" },
        { label: t("sigFigs"), value: String(main.significantCount), emphasize: true },
        { label: t("leadingZeros"), value: String(leading) },
        { label: t("trailingZeros"), value: String(trailing) },
      ],
    },
    {
      title: t("groupRule"),
      rows: [
        { label: `${t("precisionKept")} (${isAddSub ? t("decimalPlaces") : t("sigFigs")})`, formula: ruleFormula, value: ruleValue, emphasize: true },
        { label: t("decidingDigit"), formula: main.decidingDigit !== null ? `${main.decidingDigit} ${main.roundsUp ? "≥" : "<"} 5` : undefined, value: main.decidingDigit !== null ? String(main.decidingDigit) : t("none") },
        { label: t("direction"), value: main.decidingDigit === null ? t("none") : main.roundsUp ? t("up") : t("down") },
        { label: t("droppedDigits"), value: dropped.length > 0 ? dropped.join(" ") : t("none") },
      ],
    },
    {
      title: t("groupResult"),
      rows: [
        { label: t("rawResult"), formula: binary ? `${a} ${OP_SYMBOL[operation as keyof typeof OP_SYMBOL]} ${b}` : undefined, value: rawStr },
        { label: t("roundedResult"), formula: operation === "count" ? undefined : `${rawStr} → ${plainRounded}`, value: plainRounded, emphasize: true },
        { label: isAddSub ? t("decimalPlaces") : t("sigFigs"), value: isAddSub ? String(result.resultDecimalPlaces ?? 0) : String(sf) },
        { label: t("scientific"), value: sci },
      ],
    },
  ];

  const legend = [
    { color: p.primary, label: t("legendSignificant") },
    { color: p.muted, label: t("legendPlaceholder") },
    { color: p.danger, label: t("legendDropped") },
  ];

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      drawing={
        <div className="relative h-full">
          <Scene3D camera={camera}>
            <SignificantFiguresScene3D towers={towers} />
          </Scene3D>
          <ul className="pointer-events-none absolute start-2 top-2 flex flex-col gap-1 rounded-lg bg-white/80 px-2 py-1.5 text-[11px] text-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200">
            {legend.map((l) => (
              <li key={l.label} className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                {l.label}
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}
