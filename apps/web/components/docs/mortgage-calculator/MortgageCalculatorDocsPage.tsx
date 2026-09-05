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

export const RELATED_TOOLS = ["house-affordability-calculator", "debt-to-income-calculator", "loan-calculator", "affordable-loan-calculator", "compound-interest-calculator"];

// A representative 30-year, $320,000, 6.5% mortgage (sampled every ~15 payments),
// showing the classic mortgage amortization shape over a much longer term than a
// typical personal loan.
function buildSampleSchedule(): AmortizationRow[] {
  const principal = 320000;
  const monthlyRate = 0.065 / 12;
  const months = 360;
  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  let balance = principal;
  const rows: AmortizationRow[] = [];
  for (let m = 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    const principalPortion = payment - interest;
    balance -= principalPortion;
    if (m % 15 === 0 || m === 1) rows.push({ period: m, principal: principalPortion, interest });
  }
  return rows;
}

export async function getMortgageCalculatorTocItems(): Promise<TocItem[]> {
  const t = await getTranslations("docs.tools.mortgage-calculator");
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

export default async function MortgageCalculatorDocsPage() {
  const t = await getTranslations("docs.tools.mortgage-calculator");
  const tNav = await getTranslations("docsNav");
  const tTools = await getTranslations("tools");

  const variableRows = t.raw("variables") as VariableRow[];
  const edgeCases = t.raw("edgeCases") as EdgeCase[];
  const faqItems = t.raw("faq") as FAQItem[];
  const flowchartSteps = t.raw("flowchart.steps") as string[];
  const sampleSchedule = buildSampleSchedule();

  return (
    <>
      <DocsBreadcrumb items={[{ label: tNav("overview"), href: "/docs" }, { label: tNav("toolsGuide"), href: "/docs" }, { label: tTools("mortgage-calculator.title") }]} />
      <DocsHero title={tTools("mortgage-calculator.title")} version={t("version")} description={t("description")} />

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
            { label: t("anatomy.labelPrincipalInterest"), value: 2020, colorClass: "fill-blue-600 dark:fill-blue-400" },
            { label: t("anatomy.labelTax"), value: 350, colorClass: "fill-orange-400 dark:fill-orange-500" },
            { label: t("anatomy.labelInsurance"), value: 120, colorClass: "fill-emerald-500 dark:fill-emerald-400" },
            { label: t("anatomy.labelHoa"), value: 50, colorClass: "fill-violet-500 dark:fill-violet-400" },
            { label: t("anatomy.labelPmi"), value: 90, colorClass: "fill-rose-500 dark:fill-rose-400" },
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
