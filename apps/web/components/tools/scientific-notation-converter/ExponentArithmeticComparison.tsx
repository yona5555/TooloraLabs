"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { ScientificNotationConverter } from "@tooloralabs/tools";

const tool = new ScientificNotationConverter();
const A = { c: 4, e: 6 };
const B = { c: 2, e: 2 };

/** Type #5 (Ranked Horizontal Bar List): the same two numbers in scientific notation, run through all four operations' exponent rules — add exponents for multiply, subtract for divide — ranked by the resulting exponent. */
export default function ExponentArithmeticComparison() {
  const t = useTranslations("tools.scientific-notation-converter.education.exponentArithmetic");

  const multiply = tool.execute({ operation: "multiply", standardValue: 0, coefficientA: A.c, exponentA: A.e, coefficientB: B.c, exponentB: B.e }, { locale: "en-US" });
  const divide = tool.execute({ operation: "divide", standardValue: 0, coefficientA: A.c, exponentA: A.e, coefficientB: B.c, exponentB: B.e }, { locale: "en-US" });
  if (!multiply.success || !divide.success) return null;

  const rows = [
    { key: "a", label: "A", exponent: A.e },
    { key: "b", label: "B", exponent: B.e },
    { key: "multiply", label: t("multiplyLabel"), exponent: multiply.data.scientific.exponent },
    { key: "divide", label: t("divideLabel"), exponent: divide.data.scientific.exponent },
  ].sort((x, y) => y.exponent - x.exponent);

  const minExp = Math.min(...rows.map((r) => r.exponent));
  const bars = rows.map((r) => ({ label: r.label, value: r.exponent - minExp + 1, formatted: `10^${r.exponent}`, highlight: r.key === "multiply" || r.key === "divide" }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { a: `${A.c}×10^${A.e}`, b: `${B.c}×10^${B.e}` })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("multiplyLabel"), value: `${multiply.data.scientific.coefficient}×10^${multiply.data.scientific.exponent}` },
            { label: t("divideLabel"), value: `${divide.data.scientific.coefficient}×10^${divide.data.scientific.exponent}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
