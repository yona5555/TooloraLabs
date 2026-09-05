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
import GrowthCurveDiagram from "@/components/docs/GrowthCurveDiagram";

export const RELATED_TOOLS = ["compound-interest-calculator", "mortgage-calculator", "debt-to-income-calculator", "affordable-loan-calculator", "house-affordability-calculator"];

// A representative example (age 30 -> 65, $20,000 starting, $300/month at 7%) — 35 years of
// monthly compounding sampled yearly, illustrating the shape of any retirement projection.
function buildSampleGrowth() {
  const years = 35;
  const monthlyRate = 0.07 / 12;
  let balance = 20000;
  const points = [{ x: 0, y: balance }];
  for (let year = 1; year <= years; year++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate) + 300;
    }
    points.push({ x: year, y: Math.round(balance) });
  }
  return points;
}

export async function getRetirementCalculatorTocItems(): Promise<TocItem[]> {
  const t = await getTranslations("docs.tools.retirement-calculator");
  return [
    { id: "formula", label: t("sectionFormula") },
    { id: "flowchart", label: t("sectionFlowchart") },
    { id: "growth", label: t("sectionGrowth") },
    { id: "anatomy", label: t("sectionAnatomy") },
    { id: "variables", label: t("sectionVariables") },
    { id: "edge-cases", label: t("sectionEdgeCases") },
    { id: "faq", label: t("sectionFaq") },
    { id: "related-tools", label: t("sectionRelatedTools") },
  ];
}

export default async function RetirementCalculatorDocsPage() {
  const t = await getTranslations("docs.tools.retirement-calculator");
  const tNav = await getTranslations("docsNav");
  const tTools = await getTranslations("tools");

  const variableRows = t.raw("variables") as VariableRow[];
  const edgeCases = t.raw("edgeCases") as EdgeCase[];
  const faqItems = t.raw("faq") as FAQItem[];
  const flowchartSteps = t.raw("flowchart.steps") as string[];
  const growthPoints = buildSampleGrowth();

  return (
    <>
      <DocsBreadcrumb items={[{ label: tNav("overview"), href: "/docs" }, { label: tNav("toolsGuide"), href: "/docs" }, { label: tTools("retirement-calculator.title") }]} />
      <DocsHero title={tTools("retirement-calculator.title")} version={t("version")} description={t("description")} />

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

      <DocsSection id="growth" title={t("sectionGrowth")}>
        <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("growth.intro")}</p>
        <GrowthCurveDiagram points={growthPoints} label={t("growth.label")} caption={t("growth.caption")} xUnit="y" />
      </DocsSection>

      <DocsSection id="anatomy" title={t("sectionAnatomy")}>
        <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("anatomy.intro")}</p>
        <BreakdownBarDiagram
          segments={[
            { label: t("anatomy.labelStarting"), value: 20000, colorClass: "fill-blue-600 dark:fill-blue-400" },
            { label: t("anatomy.labelContributions"), value: 126000, colorClass: "fill-orange-400 dark:fill-orange-500" },
            { label: t("anatomy.labelGrowth"), value: 208000, colorClass: "fill-emerald-500 dark:fill-emerald-400" },
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
