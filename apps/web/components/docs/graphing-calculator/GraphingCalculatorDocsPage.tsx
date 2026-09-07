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
import ScalingCurveDiagram from "@/components/docs/ScalingCurveDiagram";
import DotPlotDiagram from "@/components/docs/DotPlotDiagram";

export const RELATED_TOOLS = ["scientific-calculator", "step-by-step-math-solver", "matrix-calculator", "vector-calculator", "notepad-calculator"];

export async function getGraphingCalculatorTocItems(): Promise<TocItem[]> {
  const t = await getTranslations("docs.tools.graphing-calculator");
  return [
    { id: "formula", label: t("sectionFormula") },
    { id: "flowchart", label: t("sectionFlowchart") },
    { id: "curve", label: t("sectionCurve") },
    { id: "anatomy", label: t("sectionAnatomy") },
    { id: "variables", label: t("sectionVariables") },
    { id: "edge-cases", label: t("sectionEdgeCases") },
    { id: "faq", label: t("sectionFaq") },
    { id: "related-tools", label: t("sectionRelatedTools") },
  ];
}

const CURVE_POINTS = [
  { x: -3, y: 7 },
  { x: -2, y: 2 },
  { x: -1, y: -1 },
  { x: 0, y: -2 },
  { x: 1, y: -1 },
  { x: 2, y: 2 },
  { x: 3, y: 7 },
];

export default async function GraphingCalculatorDocsPage() {
  const t = await getTranslations("docs.tools.graphing-calculator");
  const tNav = await getTranslations("docsNav");
  const tTools = await getTranslations("tools");

  const variableRows = t.raw("variables") as VariableRow[];
  const edgeCases = t.raw("edgeCases") as EdgeCase[];
  const faqItems = t.raw("faq") as FAQItem[];
  const flowchartSteps = t.raw("flowchart.steps") as string[];

  return (
    <>
      <DocsBreadcrumb items={[{ label: tNav("overview"), href: "/docs" }, { label: tNav("toolsGuide"), href: "/docs" }, { label: tTools("graphing-calculator.title") }]} />
      <DocsHero title={tTools("graphing-calculator.title")} version={t("version")} description={t("description")} />

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

      <DocsSection id="curve" title={t("sectionCurve")}>
        <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("curve.intro")}</p>
        <ScalingCurveDiagram points={CURVE_POINTS} xLabel={t("curve.xLabel")} yLabel={t("curve.yLabel")} caption={t("curve.caption")} />
      </DocsSection>

      <DocsSection id="anatomy" title={t("sectionAnatomy")}>
        <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("anatomy.intro")}</p>
        <DotPlotDiagram
          values={[-3, -2, -1, 0, 1, 2, 3]}
          markers={[
            { value: -3, label: t("anatomy.labelMin"), colorClass: "stroke-blue-600 dark:stroke-blue-400 fill-blue-600 dark:fill-blue-400" },
            { value: 3, label: t("anatomy.labelMax"), colorClass: "stroke-purple-500 dark:stroke-purple-400 fill-purple-500 dark:fill-purple-400" },
          ]}
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
