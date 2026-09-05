import { getTranslations } from "next-intl/server";
import { Clock, Hash, Layers, Link2 } from "lucide-react";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsHero from "@/components/docs/DocsHero";
import QuickFacts from "@/components/docs/QuickFacts";
import DocsSection from "@/components/docs/DocsSection";
import FormulaBox from "@/components/docs/FormulaBox";
import VariablesTable, { type VariableRow } from "@/components/docs/VariablesTable";
import EdgeCasesList, { type EdgeCase } from "@/components/docs/EdgeCasesList";
import RelatedToolsGrid from "@/components/docs/RelatedToolsGrid";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import type { TocItem } from "@/components/docs/TableOfContents";
import CalculationFlowchart from "@/components/docs/CalculationFlowchart";
import BreakdownBarDiagram from "@/components/docs/BreakdownBarDiagram";
import AmortizationCurveDiagram, { type AmortizationRow } from "@/components/docs/AmortizationCurveDiagram";

export const RELATED_TOOLS = ["mortgage-calculator", "affordable-loan-calculator", "compound-interest-calculator", "retirement-calculator", "debt-to-income-calculator"];

// A representative 5-year, $10,000, 8% amortized loan schedule (12 sampled points),
// illustrating the shape of every amortization schedule: interest's share of each
// payment shrinks while principal's share grows, even though the payment itself is flat.
function buildSampleSchedule(): AmortizationRow[] {
  const principal = 10000;
  const monthlyRate = 0.08 / 12;
  const months = 60;
  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  let balance = principal;
  const rows: AmortizationRow[] = [];
  for (let m = 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    const principalPortion = payment - interest;
    balance -= principalPortion;
    if (m % 5 === 0 || m === 1) rows.push({ period: m, principal: principalPortion, interest });
  }
  return rows;
}

export async function getLoanCalculatorTocItems(): Promise<TocItem[]> {
  const t = await getTranslations("docs.tools.loan-calculator");
  return [
    { id: "formula", label: t("sectionFormula") },
    { id: "flowchart", label: t("sectionFlowchart") },
    { id: "amortization", label: t("sectionAmortization") },
    { id: "anatomy", label: t("sectionAnatomy") },
    { id: "variables", label: t("sectionVariables") },
    { id: "edge-cases", label: t("sectionEdgeCases") },
    { id: "faq", label: t("sectionFaq") },
    { id: "related-tools", label: t("sectionRelatedTools") },
  ];
}

export default async function LoanCalculatorDocsPage() {
  const t = await getTranslations("docs.tools.loan-calculator");
  const tNav = await getTranslations("docsNav");
  const tTools = await getTranslations("tools");

  const variableRows = t.raw("variables") as VariableRow[];
  const edgeCases = t.raw("edgeCases") as EdgeCase[];
  const faqItems = t.raw("faq") as FAQItem[];
  const flowchartSteps = t.raw("flowchart.steps") as string[];
  const sampleSchedule = buildSampleSchedule();

  return (
    <>
      <DocsBreadcrumb items={[{ label: tNav("overview"), href: "/docs" }, { label: tNav("toolsGuide"), href: "/docs" }, { label: tTools("loan-calculator.title") }]} />
      <DocsHero title={tTools("loan-calculator.title")} version={t("version")} description={t("description")} />

      <QuickFacts
        facts={[
          { icon: Hash, label: t("quickFacts.variables"), value: String(variableRows.length) },
          { icon: Layers, label: t("quickFacts.modes"), value: t("quickFacts.modesValue") },
          { icon: Link2, label: t("quickFacts.relatedTools"), value: String(RELATED_TOOLS.length) },
          { icon: Clock, label: t("quickFacts.readTime"), value: t("quickFacts.readTimeValue") },
        ]}
      />

      <DocsSection id="formula" title={t("sectionFormula")}>
        <FormulaBox expression={t("formula.expression")} note={t("formula.note")} />
      </DocsSection>

      <DocsSection id="flowchart" title={t("sectionFlowchart")}>
        <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("flowchart.intro")}</p>
        <CalculationFlowchart steps={flowchartSteps} caption={t("flowchart.caption")} />
      </DocsSection>

      <DocsSection id="amortization" title={t("sectionAmortization")}>
        <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("amortization.intro")}</p>
        <AmortizationCurveDiagram rows={sampleSchedule} labelPrincipal={t("amortization.labelPrincipal")} labelInterest={t("amortization.labelInterest")} caption={t("amortization.caption")} />
      </DocsSection>

      <DocsSection id="anatomy" title={t("sectionAnatomy")}>
        <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("anatomy.intro")}</p>
        <BreakdownBarDiagram
          segments={[
            { label: t("anatomy.labelPrincipal"), value: 10000, colorClass: "fill-blue-600 dark:fill-blue-400" },
            { label: t("anatomy.labelInterest"), value: 2150, colorClass: "fill-orange-400 dark:fill-orange-500" },
          ]}
          totalLabel={t("anatomy.labelTotal")}
          caption={t("anatomy.caption")}
        />
      </DocsSection>

      <DocsSection id="variables" title={t("sectionVariables")}>
        <VariablesTable rows={variableRows} columnSymbol={t("variablesColumns.symbol")} columnMeaning={t("variablesColumns.meaning")} columnUnit={t("variablesColumns.unit")} />
      </DocsSection>

      <DocsSection id="edge-cases" title={t("sectionEdgeCases")}>
        <EdgeCasesList cases={edgeCases} />
      </DocsSection>

      <DocsSection id="faq" title={t("sectionFaq")}>
        <FAQAccordion items={faqItems} />
      </DocsSection>

      <DocsSection id="related-tools" title={t("sectionRelatedTools")}>
        <RelatedToolsGrid slugs={RELATED_TOOLS} />
      </DocsSection>
    </>
  );
}
