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
import ValueComparisonBarDiagram from "@/components/docs/ValueComparisonBarDiagram";
import IssueAnatomyDiagram from "./IssueAnatomyDiagram";

export const RELATED_TOOLS = ["word-counter", "readability-score-calculator", "text-to-speech"];

export async function getSpellingGrammarCheckerTocItems(): Promise<TocItem[]> {
  const t = await getTranslations("docs.tools.spelling-grammar-checker");
  return [
    { id: "formula", label: t("sectionFormula") },
    { id: "flowchart", label: t("sectionFlowchart") },
    { id: "issue-types", label: t("sectionIssueTypes") },
    { id: "anatomy", label: t("sectionAnatomy") },
    { id: "variables", label: t("sectionVariables") },
    { id: "edge-cases", label: t("sectionEdgeCases") },
    { id: "faq", label: t("sectionFaq") },
    { id: "related-tools", label: t("sectionRelatedTools") },
  ];
}

export default async function SpellingGrammarCheckerDocsPage() {
  const t = await getTranslations("docs.tools.spelling-grammar-checker");
  const tNav = await getTranslations("docsNav");
  const tTools = await getTranslations("tools");

  const variableRows = t.raw("variables") as VariableRow[];
  const edgeCases = t.raw("edgeCases") as EdgeCase[];
  const faqItems = t.raw("faq") as FAQItem[];
  const flowchartSteps = t.raw("flowchart.steps") as string[];

  return (
    <>
      <DocsBreadcrumb items={[{ label: tNav("overview"), href: "/docs" }, { label: tNav("toolsGuide"), href: "/docs" }, { label: tTools("spelling-grammar-checker.title") }]} />
      <DocsHero title={tTools("spelling-grammar-checker.title")} version={t("version")} description={t("description")} />

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

      <DocsSection id="issue-types" title={t("sectionIssueTypes")}>
        <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("issueTypes.intro")}</p>
        <ValueComparisonBarDiagram
          bars={[
            { label: t("issueTypes.labelSpelling"), value: 1, colorClass: "fill-blue-600 dark:fill-blue-400" },
            { label: t("issueTypes.labelGrammar"), value: 2, colorClass: "fill-emerald-500 dark:fill-emerald-400" },
            { label: t("issueTypes.labelCapitalization"), value: 2, colorClass: "fill-orange-400 dark:fill-orange-500" },
            { label: t("issueTypes.labelPunctuation"), value: 1, colorClass: "fill-purple-500 dark:fill-purple-400" },
          ]}
          caption={t("issueTypes.caption")}
        />
      </DocsSection>

      <DocsSection id="anatomy" title={t("sectionAnatomy")}>
        <p className="mb-4 text-zinc-600 dark:text-zinc-300">{t("anatomy.intro")}</p>
        <IssueAnatomyDiagram
          fields={[
            { label: t("anatomy.labelType"), value: t("anatomy.valueType"), colorClass: "bg-blue-600 dark:bg-blue-400" },
            { label: t("anatomy.labelMessage"), value: t("anatomy.valueMessage"), colorClass: "bg-emerald-500 dark:bg-emerald-400" },
            { label: t("anatomy.labelOriginal"), value: t("anatomy.valueOriginal"), colorClass: "bg-orange-400 dark:bg-orange-500" },
            { label: t("anatomy.labelSuggestion"), value: t("anatomy.valueSuggestion"), colorClass: "bg-purple-500 dark:bg-purple-400" },
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
