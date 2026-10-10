"use client";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { oddsFromProbability, regionCounts, trialsForConfidence } from "@tooloralabs/tools";
import LiveTable3DLayout, { type LiveTableGroup, type LiveTableRow } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { REGION_SYMBOLS, useProbabilityModel } from "./ProbabilityLiveContext";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const ProbabilityScene3D = dynamic(() => import("./ProbabilityScene3D"), { ssr: false, loading: () => null });

/**
 * Deep live table (inputs → result → complements → combinations → conditionals → odds and
 * independence → long-run counts) beside 100 outcome cubes whose raised block is the answer.
 * Reads the shared live model, so it follows every keystroke and every slider, in the Result card
 * and in the encyclopedia alike.
 */
export default function ProbabilityLive3D({ camera = [4.6, 5.2, 6.2] }: { camera?: [number, number, number] }) {
  const t = useTranslations("tools.probability-calculator.live3d");
  const tf = useTranslations("tools.probability-calculator.form.fields");
  const tr = useTranslations("tools.probability-calculator.result");
  const tc = useTranslations("common.live3d");
  const { mode, b, r, single, symbol, target, f, pct } = useProbabilityModel();

  const P = (v: number) => pct(v);
  const inputs: LiveTableRow[] = single
    ? [
        { label: tf("favorable"), formula: "k", value: f(single.k) },
        { label: tf("total"), formula: "n", value: f(single.n) },
        { label: t("unfavorable"), formula: `${f(single.n)} − ${f(single.k)}`, value: f(single.n - single.k) },
      ]
    : mode === "and"
      ? [
          { label: "P(A)", formula: tf("pA"), value: P(b.pA) },
          { label: "P(B)", formula: tf("pB"), value: P(b.pB) },
        ]
      : mode === "or"
        ? [
            { label: "P(A)", formula: tf("pA"), value: P(b.pA) },
            { label: "P(B)", formula: tf("pB"), value: P(b.pB) },
            { label: "P(A∩B)", formula: tf("pBoth"), value: P(b.pAB) },
          ]
        : [
            { label: "P(A∩B)", formula: tf("pAAndB"), value: P(b.pAB) },
            { label: "P(B)", formula: tf("pB"), value: P(b.pB) },
            { label: "P(A)", formula: tf("pA"), value: P(b.pA) },
          ];

  const resultFormula = single
    ? `${f(single.k)} / ${f(single.n)}`
    : mode === "and"
      ? `${P(b.pA)} × ${P(b.pB)}`
      : mode === "or"
        ? `${P(b.pA)} + ${P(b.pB)} − ${P(b.pAB)}`
        : `${P(b.pAB)} / ${P(b.pB)}`;

  const odds = oddsFromProbability(r);
  const trials50 = trialsForConfidence(r, 0.5);

  const groups: LiveTableGroup[] = [
    { title: t("groupInputs"), rows: inputs },
    {
      title: t("groupResult"),
      rows: [
        { label: symbol, formula: resultFormula, value: P(r), emphasize: true },
        { label: t("decimal"), formula: `${f(r * 100, 2)} / 100`, value: f(r, 4) },
      ],
    },
    {
      title: t("groupEvents"),
      rows: [
        { label: "P(A′)", formula: `1 − ${P(b.pA)}`, value: P(b.notA) },
        { label: "P(B′)", formula: `1 − ${P(b.pB)}`, value: P(b.notB) },
      ],
    },
    {
      title: single ? t("groupCombosSingle") : t("groupCombos"),
      rows: [
        {
          label: `${t("intersection")} P(A∩B)`,
          formula: mode === "or" || mode === "conditional" ? t("given") : `${P(b.pA)} × ${P(b.pB)}`,
          value: P(b.pAB),
        },
        { label: `${t("union")} P(A∪B)`, formula: `${P(b.pA)} + ${P(b.pB)} − ${P(b.pAB)}`, value: P(b.union) },
        { label: `${t("aOnly")} P(A∩B′)`, formula: `${P(b.pA)} − ${P(b.pAB)}`, value: P(b.aOnly) },
        { label: `${t("bOnly")} P(A′∩B)`, formula: `${P(b.pB)} − ${P(b.pAB)}`, value: P(b.bOnly) },
        { label: `${t("neither")} P(A′∩B′)`, formula: `1 − ${P(b.union)}`, value: P(b.neither) },
        { label: t("exactlyOne"), formula: `${P(b.aOnly)} + ${P(b.bOnly)}`, value: P(b.exactlyOne) },
      ],
    },
    {
      title: t("groupConditional"),
      rows: [
        { label: "P(A|B)", formula: `${P(b.pAB)} / ${P(b.pB)}`, value: Number.isFinite(b.aGivenB) ? P(b.aGivenB) : t("undefined") },
        { label: "P(B|A)", formula: `${P(b.pAB)} / ${P(b.pA)}`, value: Number.isFinite(b.bGivenA) ? P(b.bGivenA) : t("undefined") },
      ],
    },
    {
      title: t("groupOdds"),
      rows: [
        { label: tr("oddsFor"), formula: `${P(r)} : ${P(1 - r)}`, value: `${f(odds.oddsFor, 3)} : 1` },
        { label: tr("oddsAgainst"), formula: `${P(1 - r)} : ${P(r)}`, value: `${f(odds.oddsAgainst, 3)} : 1` },
        { label: t("product"), formula: `${P(b.pA)} × ${P(b.pB)}`, value: P(b.independentProduct) },
        { label: t("lift"), formula: `${P(b.pAB)} / ${P(b.independentProduct)}`, value: Number.isFinite(b.lift) ? f(b.lift, 3) : t("undefined") },
        { label: t("relation"), formula: "P(A∩B) ≟ P(A)·P(B)", value: t(`relations.${b.relation}`), emphasize: true },
      ],
    },
    {
      title: t("groupLongRun"),
      rows: [
        { label: t("per100"), formula: `100 × ${f(r, 4)}`, value: f(r * 100, 2) },
        { label: t("per1000"), formula: `1000 × ${f(r, 4)}`, value: f(r * 1000, 1) },
        { label: t("oneIn"), formula: `1 / ${f(r, 4)}`, value: r > 0 ? f(1 / r, 2) : "∞" },
        { label: t("trials50"), formula: "1 − (1 − p)ⁿ ≥ 50%", value: Number.isFinite(trials50) ? f(trials50, 0) : "∞" },
      ],
    },
  ];

  const counts = regionCounts(b, 100);
  const headline =
    mode === "conditional"
      ? `${symbol} ≈ ${f(counts[0], 0)} / ${f(counts[0] + counts[2], 0)}`
      : `${symbol} ≈ ${f(counts.reduce((a, c, i) => a + (target[i] ? c : 0), 0), 0)} / 100`;

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      drawing={
        <Scene3D camera={camera}>
          <ProbabilityScene3D
            counts={counts}
            target={target}
            labels={REGION_SYMBOLS.map((s, i) => `${s} · ${f(counts[i], 0)}`) as [string, string, string, string]}
            headline={headline}
          />
        </Scene3D>
      }
    />
  );
}
