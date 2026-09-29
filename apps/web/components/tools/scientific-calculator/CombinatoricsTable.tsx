"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard, { type ReferenceTableRow } from "@/components/tool-ui/ReferenceTableCard";

const N = 5;

function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}
function nPr(n: number, r: number): number {
  return factorial(n) / factorial(n - r);
}
function nCr(n: number, r: number): number {
  return nPr(n, r) / factorial(r);
}

/** Type #17 (Tagged Reference Table): nCr and nPr for every r from 0 to 5 out of 5 — the combinations/permutations keys — tagged by which grows faster (permutations always order-sensitive, so nPr >= nCr at every r > 1). */
export default function CombinatoricsTable() {
  const t = useTranslations("tools.scientific-calculator.education.functions.combinatorics");

  const rows: ReferenceTableRow[] = Array.from({ length: N + 1 }, (_, r) => {
    const combos = nCr(N, r);
    const perms = nPr(N, r);
    const same = combos === perms;
    return {
      key: `r${r}`,
      label: `r = ${r}`,
      value: `C = ${combos}, P = ${perms}`,
      tag: same ? { text: t("tagSame"), colorClass: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" } : { text: t("tagOrdered"), colorClass: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" },
    };
  });

  return <ReferenceTableCard title={t("title")} caption={t("intro", { n: N })} columnLabel={t("columnR")} columnValue={t("columnValues")} rows={rows} />;
}
