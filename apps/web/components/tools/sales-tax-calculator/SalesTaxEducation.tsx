import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import SalesTaxAdditionDiagram from "./SalesTaxAdditionDiagram";
import SalesTaxVsVatFlowDiagram from "./SalesTaxVsVatFlowDiagram";
import SalesTaxRateStackDonut from "./SalesTaxRateStackDonut";
import SalesTaxAddVsReverseModeDiagram from "./SalesTaxAddVsReverseModeDiagram";
import SalesTaxRateGauge from "./SalesTaxRateGauge";
import SalesTaxWorkedExamplesBar from "./SalesTaxWorkedExamplesBar";
import SalesTaxNoTaxStatesDiagram from "./SalesTaxNoTaxStatesDiagram";
import SalesTaxJurisdictionCompareChart from "./SalesTaxJurisdictionCompareChart";
import SalesTaxNexusTimelineDiagram from "./SalesTaxNexusTimelineDiagram";
import SalesTaxMultiItemInvoiceBar from "./SalesTaxMultiItemInvoiceBar";

type ExampleRow = { scenario: string; result: string };
type VariableItem = { name: string; description: string };
type ApplicationItem = { title: string; description: string };

export default async function SalesTaxEducation() {
  const t = await getTranslations("tools.sales-tax-calculator.education");
  const tRoot = await getTranslations("tools.sales-tax-calculator");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const variableItems = t.raw("variables.items") as VariableItem[];
  const applicationItems = t.raw("applications.items") as ApplicationItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>

        <SectionCard title={t("intro.diagram.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro.diagram.caption")}</p>
          <div className="mt-4">
            <IndicatorWithTable
              indicator={<SalesTaxAdditionDiagram subtotalLabel={t("intro.diagram.subtotalLabel")} taxLabel={t("intro.diagram.taxLabel")} totalLabel={t("intro.diagram.totalLabel")} />}
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("intro.diagram.subtotalLabel"), value: "$100.00" },
                { label: t("intro.diagram.taxLabel"), value: "+$8.00" },
                { label: t("intro.diagram.totalLabel"), value: "$108.00", emphasize: true },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title={t("intro.vsVatDiagram.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro.vsVatDiagram.caption")}</p>
          <div className="mt-4">
            <IndicatorWithTable
              indicator={
                <SalesTaxVsVatFlowDiagram
                  salesTaxLabel={t("intro.vsVatDiagram.salesTaxLabel")}
                  vatLabel={t("intro.vsVatDiagram.vatLabel")}
                  stageLabel={t("intro.vsVatDiagram.stageLabel")}
                  taxHereLabel={t("intro.vsVatDiagram.taxHereLabel")}
                  noTaxLabel={t("intro.vsVatDiagram.noTaxLabel")}
                />
              }
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("intro.vsVatDiagram.salesTaxLabel"), value: t("intro.vsVatDiagram.oneTimeLabel") },
                { label: t("intro.vsVatDiagram.vatLabel"), value: t("intro.vsVatDiagram.everyStageLabel") },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title={t("intro.rateStackDonut.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro.rateStackDonut.caption")}</p>
          <div className="mt-4">
            <IndicatorWithTable
              indicator={
                <SalesTaxRateStackDonut
                  centerValue="9%"
                  centerLabel={t("intro.rateStackDonut.centerLabel")}
                  segments={[
                    { key: "state", value: 6.5, label: t("intro.rateStackDonut.state"), colorClass: "stroke-violet-500 dark:stroke-violet-400", dotColorClass: "bg-violet-500 dark:bg-violet-400" },
                    { key: "county", value: 1, label: t("intro.rateStackDonut.county"), colorClass: "stroke-rose-500 dark:stroke-rose-400", dotColorClass: "bg-rose-500 dark:bg-rose-400" },
                    { key: "city", value: 1.5, label: t("intro.rateStackDonut.city"), colorClass: "stroke-amber-500 dark:stroke-amber-400", dotColorClass: "bg-amber-500 dark:bg-amber-400" },
                  ]}
                />
              }
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("intro.rateStackDonut.state"), value: "6.5%" },
                { label: t("intro.rateStackDonut.county"), value: "1%" },
                { label: t("intro.rateStackDonut.city"), value: "1.5%" },
                { label: t("intro.rateStackDonut.centerLabel"), value: "9%", emphasize: true },
              ]}
            />
          </div>
        </SectionCard>
      </InfoSection>

      <InfoSection title={t("variables.title")}>
        <p>{t("variables.intro")}</p>
        <dl className="space-y-4">
          {variableItems.map((item) => (
            <div key={item.name}>
              <dt className="font-semibold">{item.name}</dt>
              <dd className="mt-1">{item.description}</dd>
            </div>
          ))}
        </dl>

        <SectionCard title={t("variables.addReverseDiagram.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("variables.addReverseDiagram.caption")}</p>
          <div className="mt-4">
            <SalesTaxAddVsReverseModeDiagram
              addModeLabel={t("variables.addReverseDiagram.addModeLabel")}
              reverseModeLabel={t("variables.addReverseDiagram.reverseModeLabel")}
              priceLabel={t("variables.addReverseDiagram.priceLabel")}
              totalLabel={t("variables.addReverseDiagram.totalLabel")}
            />
          </div>
        </SectionCard>

        <SectionCard title={t("variables.rateGauge.title")}>
          <div className="mt-2">
            <IndicatorWithTable
              indicator={<SalesTaxRateGauge valueLabel="8.875%" />}
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("variables.rateGauge.zoneNone"), value: "0–1%" },
                { label: t("variables.rateGauge.zoneLow"), value: "1–6%" },
                { label: t("variables.rateGauge.zoneTypical"), value: "6–9%" },
                { label: t("variables.rateGauge.zoneHigh"), value: "9–11%" },
                { label: tRoot("form.taxRateLabel"), value: "8.875%", emphasize: true },
              ]}
            />
          </div>
          <p className="mt-3 text-center text-sm font-semibold text-amber-600 dark:text-amber-400">{t("variables.rateGauge.caption")}</p>
        </SectionCard>
      </InfoSection>

      <InfoSection title={t("examples.title")}>
        <p>{t("examples.intro")}</p>
        <div dir="ltr" className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-current/30 text-start">
                <th className="px-3 py-2 text-start font-semibold">{t("examples.columnScenario")}</th>
                <th className="px-3 py-2 text-start font-semibold">{t("examples.columnResult")}</th>
              </tr>
            </thead>
            <tbody>
              {exampleRows.map((row) => (
                <tr key={row.scenario} className="border-b border-current/10">
                  <td className="px-3 py-2.5">{row.scenario}</td>
                  <td className="px-3 py-2.5 font-mono font-semibold">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SectionCard title={t("examples.workedExamplesBar.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("examples.workedExamplesBar.caption")}</p>
          <div className="mt-4">
            <IndicatorWithTable
              indicator={
                <SalesTaxWorkedExamplesBar
                  bars={[
                    { key: "e1", label: t("examples.workedExamplesBar.label1"), value: 3.0, formatted: "$3.00" },
                    { key: "e2", label: t("examples.workedExamplesBar.label2"), value: 22.19, formatted: "$22.19" },
                    { key: "e3", label: t("examples.workedExamplesBar.label3"), value: 7.2, formatted: "$7.20" },
                    { key: "e4", label: t("examples.workedExamplesBar.label4"), value: 8.0, formatted: "$8.00" },
                  ]}
                />
              }
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("examples.workedExamplesBar.label1"), value: "$3.00" },
                { label: t("examples.workedExamplesBar.label2"), value: "$22.19" },
                { label: t("examples.workedExamplesBar.label3"), value: "$7.20" },
                { label: t("examples.workedExamplesBar.label4"), value: "$8.00" },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title={t("examples.noTaxStatesDiagram.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("examples.noTaxStatesDiagram.caption")}</p>
          <div className="mt-4">
            <SalesTaxNoTaxStatesDiagram states={["DE", "MT", "NH", "OR"]} noTaxLabel={t("examples.noTaxStatesDiagram.noTaxLabel")} typicalLabel={t("examples.noTaxStatesDiagram.typicalLabel")} />
          </div>
        </SectionCard>
      </InfoSection>

      <InfoSection title={t("applications.title")}>
        <p>{t("applications.intro")}</p>
        <div className="space-y-4">
          {applicationItems.map((item) => (
            <div key={item.title}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1">{item.description}</p>
            </div>
          ))}
        </div>

        <SectionCard title={t("applications.jurisdictionChart.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("applications.jurisdictionChart.caption")}</p>
          <div className="mt-4">
            <IndicatorWithTable
              indicator={
                <SalesTaxJurisdictionCompareChart
                  items={[
                    { key: "or", label: t("applications.jurisdictionChart.oregon"), totalCost: 100 },
                    { key: "typical", label: t("applications.jurisdictionChart.typical"), totalCost: 107 },
                    { key: "nyc", label: t("applications.jurisdictionChart.nyc"), totalCost: 108.88 },
                    { key: "chi", label: t("applications.jurisdictionChart.chicago"), totalCost: 110.25 },
                  ]}
                />
              }
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("applications.jurisdictionChart.oregon"), value: "$100.00" },
                { label: t("applications.jurisdictionChart.typical"), value: "$107.00" },
                { label: t("applications.jurisdictionChart.nyc"), value: "$108.88" },
                { label: t("applications.jurisdictionChart.chicago"), value: "$110.25" },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title={t("applications.nexusTimeline.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("applications.nexusTimeline.caption")}</p>
          <div className="mt-4">
            <IndicatorWithTable
              indicator={
                <SalesTaxNexusTimelineDiagram
                  quillLabel={t("applications.nexusTimeline.quillLabel")}
                  quillYear="1992"
                  wayfairLabel={t("applications.nexusTimeline.wayfairLabel")}
                  wayfairYear="2018"
                  physicalLabel={t("applications.nexusTimeline.physicalLabel")}
                  economicLabel={t("applications.nexusTimeline.economicLabel")}
                />
              }
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("applications.nexusTimeline.quillLabel"), value: "1992" },
                { label: t("applications.nexusTimeline.wayfairLabel"), value: "2018", emphasize: true },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title={t("applications.invoiceBar.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("applications.invoiceBar.caption")}</p>
          <div className="mt-4">
            <IndicatorWithTable
              indicator={
                <SalesTaxMultiItemInvoiceBar
                  taxAmount={9}
                  taxLabel={t("applications.invoiceBar.taxLabel")}
                  totalLabel={t("applications.invoiceBar.totalLabel")}
                  items={[
                    { key: "i1", label: t("applications.invoiceBar.item1"), amount: 40 },
                    { key: "i2", label: t("applications.invoiceBar.item2"), amount: 35 },
                    { key: "i3", label: t("applications.invoiceBar.item3"), amount: 25 },
                  ]}
                />
              }
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("applications.invoiceBar.item1"), value: "$40.00" },
                { label: t("applications.invoiceBar.item2"), value: "$35.00" },
                { label: t("applications.invoiceBar.item3"), value: "$25.00" },
                { label: t("applications.invoiceBar.taxLabel"), value: "$9.00" },
                { label: t("applications.invoiceBar.totalLabel"), value: "$109.00", emphasize: true },
              ]}
            />
          </div>
        </SectionCard>
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection id="faq" title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
      </InfoSection>

      <InfoSection id="behind-the-tool" title={t("behindTheTool.title")}>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.history.title")}</h3>
          <p className="mt-2">{t("behindTheTool.history.paragraph")}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.modernDevelopments.title")}</h3>
          <p className="mt-2">{t("behindTheTool.modernDevelopments.paragraph")}</p>
        </div>
        <AcademicPathSection
          title={t("behindTheTool.academicPath.title")}
          intro={t("behindTheTool.academicPath.intro")}
          universities={universities}
        />
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection title={t("references.title")}>
        <p>{t("references.citation")}</p>
        <p className="text-sm opacity-70">{t("references.note")}</p>
        <a
          href={t("references.url")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex rounded-sm border border-current/40 px-5 py-2.5 text-sm font-semibold no-underline transition hover:bg-current/5"
        >
          {t("references.readOriginal")}
        </a>
      </InfoSection>
    </EncyclopediaPaper>
  );
}
