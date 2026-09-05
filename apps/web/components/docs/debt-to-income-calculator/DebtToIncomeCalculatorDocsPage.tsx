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
import RatioGauge from "@/components/tool-ui/RatioGauge";

export const RELATED_TOOLS = ["house-affordability-calculator", "mortgage-calculator", "loan-calculator", "affordable-loan-calculator", "retirement-calculator"];

const ZONE_STROKE_COLORS: Record<string, string> = {
  healthy: "stroke-green-500 dark:stroke-green-400",
  manageable: "stroke-amber-500 dark:stroke-amber-400",
  high: "stroke-orange-500 dark:stroke-orange-400",
  veryHigh: "stroke-red-500 dark:stroke-red-400",
};

export async function getDebtToIncomeCalculatorTocItems(): Promise<TocItem[]> {
  const t = await getTranslations("docs.tools.debt-to-income-calculator");
  return [
    { id: "formula", label: t("sectionFormula") },
    { id: "flowchart", label: t("sectionFlowchart") },
    { id: "ratio", label: t("sectionRatio") },
    { id: "anatomy", label: t("sectionAnatomy") },
    { id: "variables", label: t("sectionVariables") },
    { id: "edge-cases", label: t("sectionEdgeCases") },
    { id: "faq", label: t("sectionFaq") },
    { id: "related-tools", label: t("sectionRelatedTools") },
  ];
}

export default async function DebtToIncomeCalculatorDocsPage() {
  const t = await getTranslations("docs.tools.debt-to-income-calculator");
  const tNav = await getTranslations("docsNav");
  const tTools = await getTranslations("tools");

  const variableRows = t.raw("variables") as VariableRow[];
  const edgeCases = t.raw("edgeCases") as EdgeCase[];
  const faqItems = t.raw("faq") as FAQItem[];
  const flowchartSteps = t.raw("flowchart.steps") as string[];

  return (
    <>
      <DocsBreadcrumb items={[{ label: tNav("overview"), href: "/docs" }, { label: tNav("toolsGuide"), href: "/docs" }, { label: tTools("debt-to-income-calculator.title") }]} />
      <DocsHero title={tTools("debt-to-income-calculator.title")} version={t("version")} description={t("description")} />

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

      <DocsSection id="ratio" title={t("sectionRatio")}>
        <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("ratio.intro")}</p>
        <div className="flex justify-center">
          <RatioGauge
            value={38}
            domainMin={0}
            domainMax={60}
            zones={[
              { key: "healthy", from: 0, to: 36, colorClass: ZONE_STROKE_COLORS.healthy },
              { key: "manageable", from: 36, to: 43, colorClass: ZONE_STROKE_COLORS.manageable },
              { key: "high", from: 43, to: 50, colorClass: ZONE_STROKE_COLORS.high },
              { key: "veryHigh", from: 50, to: 60, colorClass: ZONE_STROKE_COLORS.veryHigh },
            ]}
            valueLabel="38%"
            caption={t("ratio.gaugeCaption")}
            ticks={[0, 36, 43, 50, 60]}
            tickFormatter={(t2) => `${t2}%`}
          />
        </div>
        <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("ratio.caption")}</p>
      </DocsSection>

      <DocsSection id="anatomy" title={t("sectionAnatomy")}>
        <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("anatomy.intro")}</p>
        <BreakdownBarDiagram
          segments={[
            { label: t("anatomy.labelHousing"), value: 1500, colorClass: "fill-blue-600 dark:fill-blue-400" },
            { label: t("anatomy.labelCar"), value: 400, colorClass: "fill-teal-500 dark:fill-teal-400" },
            { label: t("anatomy.labelStudent"), value: 300, colorClass: "fill-violet-500 dark:fill-violet-400" },
            { label: t("anatomy.labelCreditCard"), value: 200, colorClass: "fill-rose-500 dark:fill-rose-400" },
            { label: t("anatomy.labelOther"), value: 100, colorClass: "fill-zinc-400 dark:fill-zinc-500" },
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
