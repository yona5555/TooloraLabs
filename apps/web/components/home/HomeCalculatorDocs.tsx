import { getTranslations } from "next-intl/server";
import { BookOpen, Clock, Hash, Layers, Link2 } from "lucide-react";
import QuickFacts from "@/components/docs/QuickFacts";
import DocsSection from "@/components/docs/DocsSection";
import FormulaBox from "@/components/docs/FormulaBox";
import VariablesTable, { type VariableRow } from "@/components/docs/VariablesTable";
import EdgeCasesList, { type EdgeCase } from "@/components/docs/EdgeCasesList";
import RelatedToolsGrid from "@/components/docs/RelatedToolsGrid";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import CalculationFlowchart from "@/components/docs/CalculationFlowchart";
import ScalingCurveDiagram from "@/components/docs/ScalingCurveDiagram";
import ValueComparisonBarDiagram from "@/components/docs/ValueComparisonBarDiagram";
import TableOfContents from "@/components/docs/TableOfContents";

const RELATED_TOOLS = ["step-by-step-math-solver", "graphing-calculator", "notepad-calculator", "percentage-calculator", "fraction-calculator"];

const SINE_POINTS = [
  { x: 0, y: 0 },
  { x: 60, y: 0.866 },
  { x: 120, y: 0.866 },
  { x: 180, y: 0 },
  { x: 240, y: -0.866 },
  { x: 300, y: -0.866 },
  { x: 360, y: 0 },
];

/**
 * A static documentation section directly under the homepage calculator
 * card, in the same center column at the same width — not a separate page
 * and not the third-column idea from an earlier task. It reuses the exact
 * same building blocks and the exact same `docs.tools.scientific-calculator`
 * translation content as the standalone /docs/scientific-calculator page
 * (already complete and verified across all 6 locales), including the same
 * sticky "On This Page" TableOfContents component that page uses — just
 * without that page's breadcrumb/sidebar-nav chrome, since here it's one
 * section among several on the homepage rather than a page of its own.
 */
export default async function HomeCalculatorDocs() {
  const t = await getTranslations("docs.tools.scientific-calculator");
  const tTools = await getTranslations("tools");

  const variableRows = t.raw("variables") as VariableRow[];
  const edgeCases = t.raw("edgeCases") as EdgeCase[];
  const faqItems = t.raw("faq") as FAQItem[];
  const flowchartSteps = t.raw("flowchart.steps") as string[];

  const tocItems = [
    { id: "home-calc-formula", label: t("sectionFormula") },
    { id: "home-calc-flowchart", label: t("sectionFlowchart") },
    { id: "home-calc-curve", label: t("sectionCurve") },
    { id: "home-calc-anatomy", label: t("sectionAnatomy") },
    { id: "home-calc-variables", label: t("sectionVariables") },
    { id: "home-calc-edge-cases", label: t("sectionEdgeCases") },
    { id: "home-calc-faq", label: t("sectionFaq") },
    { id: "home-calc-related-tools", label: t("sectionRelatedTools") },
  ];

  return (
    <div className="grid grid-cols-1 gap-8 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-10 lg:p-8">
      <div className="min-w-0">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <BookOpen size={20} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{tTools("scientific-calculator.title")}</h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">{t("version")}</span>
            </div>
            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("description")}</p>
          </div>
        </div>

        <QuickFacts
          facts={[
            { icon: Hash, label: t("quickFacts.variables"), value: String(variableRows.length) },
            { icon: Layers, label: t("quickFacts.modes"), value: t("quickFacts.modesValue") },
            { icon: Link2, label: t("quickFacts.relatedTools"), value: String(RELATED_TOOLS.length) },
            { icon: Clock, label: t("quickFacts.readTime"), value: t("quickFacts.readTimeValue") },
          ]}
        />

        <DocsSection id="home-calc-formula" title={t("sectionFormula")}>
          <FormulaBox expression={t("formula.expression")} note={t("formula.note")} />
        </DocsSection>

        <DocsSection id="home-calc-flowchart" title={t("sectionFlowchart")}>
          <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("flowchart.intro")}</p>
          <CalculationFlowchart steps={flowchartSteps} caption={t("flowchart.caption")} />
        </DocsSection>

        <DocsSection id="home-calc-curve" title={t("sectionCurve")}>
          <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("curve.intro")}</p>
          <ScalingCurveDiagram points={SINE_POINTS} xLabel={t("curve.xLabel")} yLabel={t("curve.yLabel")} caption={t("curve.caption")} />
        </DocsSection>

        <DocsSection id="home-calc-anatomy" title={t("sectionAnatomy")}>
          <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("anatomy.intro")}</p>
          <ValueComparisonBarDiagram
            bars={[
              { label: t("anatomy.labelSin"), value: 0.5, colorClass: "fill-blue-600 dark:fill-blue-400" },
              { label: t("anatomy.labelCos"), value: 0.866, colorClass: "fill-emerald-500 dark:fill-emerald-400" },
              { label: t("anatomy.labelTan"), value: 0.577, colorClass: "fill-purple-500 dark:fill-purple-400" },
            ]}
            caption={t("anatomy.caption")}
          />
        </DocsSection>

        <DocsSection id="home-calc-variables" title={t("sectionVariables")}>
          <VariablesTable rows={variableRows} columnSymbol={t("variablesColumns.symbol")} columnMeaning={t("variablesColumns.meaning")} columnUnit={t("variablesColumns.unit")} />
        </DocsSection>

        <DocsSection id="home-calc-edge-cases" title={t("sectionEdgeCases")}>
          <EdgeCasesList cases={edgeCases} />
        </DocsSection>

        <DocsSection id="home-calc-faq" title={t("sectionFaq")}>
          <FAQAccordion items={faqItems} />
        </DocsSection>

        <DocsSection id="home-calc-related-tools" title={t("sectionRelatedTools")}>
          <RelatedToolsGrid slugs={RELATED_TOOLS} />
        </DocsSection>
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-24">
          <TableOfContents items={tocItems} />
        </div>
      </div>
    </div>
  );
}
