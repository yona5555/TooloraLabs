"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { bezout, divisorsOf, euclidSteps, factorizeInt, primeExponentTable, relationKind } from "@tooloralabs/tools";
import LiveTable3DLayout, { type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import type { GcfLcmTower } from "./GcfLcmScene3D";
import { sup, useGcfLcmModel } from "./GcfLcmLiveContext";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const GcfLcmScene3D = dynamic(() => import("./GcfLcmScene3D"), { ssr: false, loading: () => null });

const MAX_EUCLID_ROWS = 6;
const MAX_DIVISORS_SHOWN = 8;

/**
 * Deep live table (inputs → factorizations → divisors → shared primes → Euclid → results) beside
 * the 3D prime-factor towers. Reads the shared live numbers, so it follows every keystroke and
 * every slider move, in the Result card and in the encyclopedia alike.
 */
export default function GcfLcmLive3D({ camera = [3.6, 2.6, 6.2] }: { camera?: [number, number, number] }) {
  const t = useTranslations("tools.gcf-lcm-calculator.live3d");
  const tc = useTranslations("common.live3d");
  const { nums, a, b, result, f, fz } = useGcfLcmModel();
  const [replay, setReplay] = useState(0);

  const table = useMemo(() => primeExponentTable(nums), [nums]);
  const steps = useMemo(() => euclidSteps(Math.max(a, b), Math.min(a, b)), [a, b]);
  const bz = useMemo(() => bezout(a, b), [a, b]);
  const { gcf, lcm } = result;
  const p = (v: number) => (v < 0 ? `(${f(v)})` : f(v));
  const pw = (prime: number, e: number) => `${f(prime)}${sup(e)}`;
  const powList = (pick: "min" | "max") => {
    const parts = table.filter((r) => r[pick] > 0).map((r) => pw(r.prime, r[pick]));
    return parts.length ? parts.join(" × ") : f(1);
  };
  const shown = (ds: number[]) => (ds.length > MAX_DIVISORS_SHOWN ? `${ds.slice(0, MAX_DIVISORS_SHOWN).map((d) => f(d)).join(", ")}, …` : ds.map((d) => f(d)).join(", "));
  const common = divisorsOf(gcf);
  const kind = relationKind(nums);

  const euclidRows = steps.slice(0, MAX_EUCLID_ROWS).map((s, i) => ({
    label: t("euclidStep", { n: i + 1 }),
    formula: `${f(s.a)} = ${f(s.q)} × ${f(s.b)} + ${f(s.r)}`,
    value: f(s.r),
    emphasize: s.r === 0,
  }));
  if (steps.length > MAX_EUCLID_ROWS) {
    const last = steps[steps.length - 1];
    euclidRows.push({ label: t("moreSteps", { n: steps.length - MAX_EUCLID_ROWS }), formula: `… ${f(last.a)} = ${f(last.q)} × ${f(last.b)} + 0`, value: f(0), emphasize: true });
  }

  const groups: LiveTableGroup[] = [
    {
      title: t("groupFactorizations"),
      rows: nums.map((n) => {
        const fac = factorizeInt(n);
        const flat = fac.flatMap((x) => Array.from({ length: x.exponent }, () => f(x.prime)));
        return { label: f(n), formula: flat.length ? flat.join(" × ") : f(1), value: fz(fac) };
      }),
    },
    {
      title: t("groupDivisors"),
      rows: nums.map((n) => {
        const ds = divisorsOf(n);
        return { label: t("divisorsOf", { n: f(n) }), formula: shown(ds), value: f(ds.length) };
      }),
    },
    {
      title: t("groupPrimes"),
      rows: table.map((r) => ({
        label: t("primeRow", { p: f(r.prime) }),
        formula: `min(${r.exponents.map((e) => f(e)).join(", ")}) · max(${r.exponents.map((e) => f(e)).join(", ")})`,
        value: `${pw(r.prime, r.min)} | ${pw(r.prime, r.max)}`,
      })),
    },
    { title: t("groupEuclid", { a: f(Math.max(a, b)), b: f(Math.min(a, b)) }), rows: euclidRows },
    {
      title: t("groupResults"),
      rows: [
        { label: t("gcf"), formula: powList("min"), value: f(gcf), emphasize: true },
        { label: t("lcm"), formula: powList("max"), value: f(lcm), emphasize: true },
        ...(nums.length === 2
          ? [{ label: t("productCheck"), formula: `${f(gcf)} × ${f(lcm)} = ${f(a)} × ${f(b)}`, value: `${f(gcf * lcm)} = ${f(a * b)}` }]
          : []),
        { label: t("ratio"), formula: `${nums.map((n) => f(n)).join(" : ")} ÷ ${f(gcf)}`, value: nums.map((n) => f(n / gcf)).join(" : ") },
        { label: t("bezout"), formula: `${f(a)}·${p(bz.s)} + ${f(b)}·${p(bz.t)}`, value: `= ${f(bz.g)}` },
        { label: t("commonDivisors"), formula: shown(common), value: f(common.length) },
        { label: t("lcmSteps"), formula: nums.map((n) => `${f(lcm)} ÷ ${f(n)}`).join(" · "), value: nums.map((n) => f(lcm / n)).join(" · ") },
        { label: t("relation"), formula: `GCF = ${f(gcf)}`, value: t(`relations.${kind}`) },
      ],
    },
  ];

  const primes = table.map((r) => r.prime);
  const towers: GcfLcmTower[] = [
    ...nums.map((n, i) => ({
      label: f(n),
      kind: "number" as const,
      blocks: table.flatMap((r) =>
        Array.from({ length: r.exponents[i] }, (_, k) => ({ prime: r.prime, primeLabel: f(r.prime), shared: k < r.min })),
      ).sort((x, y) => Number(y.shared) - Number(x.shared)),
    })),
    {
      label: `GCF ${f(gcf)}`,
      kind: "gcf",
      blocks: table.flatMap((r) => Array.from({ length: r.min }, () => ({ prime: r.prime, primeLabel: f(r.prime), shared: true }))),
    },
    {
      label: `LCM ${f(lcm)}`,
      kind: "lcm",
      blocks: table
        .flatMap((r) => Array.from({ length: r.max }, (_, k) => ({ prime: r.prime, primeLabel: f(r.prime), shared: k < r.min })))
        .sort((x, y) => Number(y.shared) - Number(x.shared)),
    },
  ];

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={`${t("legend")} · ${tc("hint")}`}
      drawing={
        <div className="relative h-full">
          <Scene3D camera={camera}>
            <GcfLcmScene3D towers={towers} primes={primes} replay={replay} />
          </Scene3D>
          <button
            type="button"
            onClick={() => setReplay((n) => n + 1)}
            className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white/90 px-2 py-1 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-blue-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw size={12} aria-hidden />
            {t("replay")}
          </button>
        </div>
      }
    />
  );
}
