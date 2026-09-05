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

export const RELATED_TOOLS = ["mortgage-calculator", "debt-to-income-calculator", "loan-calculator", "affordable-loan-calculator", "retirement-calculator"];

export async function getHouseAffordabilityCalculatorTocItems(): Promise<TocItem[]> {
  const t = await getTranslations("docs.tools.house-affordability-calculator");
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

export default async function HouseAffordabilityCalculatorDocsPage() {
  const t = await getTranslations("docs.tools.house-affordability-calculator");
  const tNav = await getTranslations("docsNav");
  const tTools = await getTranslations("tools");

  const variableRows = t.raw("variables") as VariableRow[];
  const edgeCases = t.raw("edgeCases") as EdgeCase[];
  const faqItems = t.raw("faq") as FAQItem[];
  const flowchartSteps = t.raw("flowchart.steps") as string[];

  return (
    <>
      <DocsBreadcrumb items={[{ label: tNav("overview"), href: "/docs" }, { label: tNav("toolsGuide"), href: "/docs" }, { label: tTools("house-affordability-calculator.title") }]} />
      <DocsHero title={tTools("house-affordability-calculator.title")} version={t("version")} description={t("description")} />

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
            value={28}
            domainMin={0}
            domainMax={45}
            zones={[
              { key: "within", from: 0, to: 28, colorClass: "stroke-emerald-500 dark:stroke-emerald-400" },
              { key: "backend", from: 28, to: 36, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
              { key: "over", from: 36, to: 45, colorClass: "stroke-rose-500 dark:stroke-rose-400" },
            ]}
            valueLabel="28%"
            caption={t("ratio.gaugeCaption")}
            ticks={[0, 28, 36, 45]}
            tickFormatter={(t2) => `${t2}%`}
          />
        </div>
        <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("ratio.caption")}</p>
      </DocsSection>

      <DocsSection id="anatomy" title={t("sectionAnatomy")}>
        <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("anatomy.intro")}</p>
        <BreakdownBarDiagram
          segments={[
            { label: t("anatomy.labelPrincipalInterest"), value: 1450, colorClass: "fill-blue-600 dark:fill-blue-400" },
            { label: t("anatomy.labelTax"), value: 350, colorClass: "fill-orange-400 dark:fill-orange-500" },
            { label: t("anatomy.labelInsurance"), value: 120, colorClass: "fill-emerald-500 dark:fill-emerald-400" },
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
