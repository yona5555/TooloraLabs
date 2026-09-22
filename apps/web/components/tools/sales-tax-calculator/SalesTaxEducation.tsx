import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
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
        <SalesTaxAdditionDiagram
          subtotalLabel={t("intro.diagram.subtotalLabel")}
          taxLabel={t("intro.diagram.taxLabel")}
          totalLabel={t("intro.diagram.totalLabel")}
          caption={t("intro.diagram.caption")}
        />
        <SalesTaxVsVatFlowDiagram
          title={t("intro.vsVatDiagram.title")}
          salesTaxLabel={t("intro.vsVatDiagram.salesTaxLabel")}
          vatLabel={t("intro.vsVatDiagram.vatLabel")}
          stageLabel={t("intro.vsVatDiagram.stageLabel")}
          taxHereLabel={t("intro.vsVatDiagram.taxHereLabel")}
          noTaxLabel={t("intro.vsVatDiagram.noTaxLabel")}
          caption={t("intro.vsVatDiagram.caption")}
        />
        <SalesTaxRateStackDonut
          centerValue="9%"
          centerLabel={t("intro.rateStackDonut.centerLabel")}
          caption={t("intro.rateStackDonut.caption")}
          segments={[
            { key: "state", value: 6.5, label: t("intro.rateStackDonut.state"), colorClass: "stroke-violet-500 dark:stroke-violet-400" },
            { key: "county", value: 1, label: t("intro.rateStackDonut.county"), colorClass: "stroke-rose-500 dark:stroke-rose-400" },
            { key: "city", value: 1.5, label: t("intro.rateStackDonut.city"), colorClass: "stroke-amber-500 dark:stroke-amber-400" },
          ]}
        />
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
        <SalesTaxAddVsReverseModeDiagram
          addModeLabel={t("variables.addReverseDiagram.addModeLabel")}
          reverseModeLabel={t("variables.addReverseDiagram.reverseModeLabel")}
          priceLabel={t("variables.addReverseDiagram.priceLabel")}
          totalLabel={t("variables.addReverseDiagram.totalLabel")}
          caption={t("variables.addReverseDiagram.caption")}
        />
        <SalesTaxRateGauge
          valueLabel="8.875%"
          caption={t("variables.rateGauge.caption")}
          captionColorClass="text-amber-600 dark:text-amber-400"
        />
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
        <SalesTaxWorkedExamplesBar
          title={t("examples.workedExamplesBar.title")}
          caption={t("examples.workedExamplesBar.caption")}
          bars={[
            { key: "e1", label: t("examples.workedExamplesBar.label1"), value: 3.0 },
            { key: "e2", label: t("examples.workedExamplesBar.label2"), value: 22.19 },
            { key: "e3", label: t("examples.workedExamplesBar.label3"), value: 7.2 },
            { key: "e4", label: t("examples.workedExamplesBar.label4"), value: 8.0 },
          ]}
        />
        <SalesTaxNoTaxStatesDiagram
          states={["DE", "MT", "NH", "OR"]}
          noTaxLabel={t("examples.noTaxStatesDiagram.noTaxLabel")}
          typicalLabel={t("examples.noTaxStatesDiagram.typicalLabel")}
          caption={t("examples.noTaxStatesDiagram.caption")}
        />
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
        <SalesTaxJurisdictionCompareChart
          title={t("applications.jurisdictionChart.title")}
          caption={t("applications.jurisdictionChart.caption")}
          items={[
            { key: "or", label: t("applications.jurisdictionChart.oregon"), totalCost: 100 },
            { key: "typical", label: t("applications.jurisdictionChart.typical"), totalCost: 107 },
            { key: "nyc", label: t("applications.jurisdictionChart.nyc"), totalCost: 108.88 },
            { key: "chi", label: t("applications.jurisdictionChart.chicago"), totalCost: 110.25 },
          ]}
        />
        <SalesTaxNexusTimelineDiagram
          quillLabel={t("applications.nexusTimeline.quillLabel")}
          quillYear="1992"
          wayfairLabel={t("applications.nexusTimeline.wayfairLabel")}
          wayfairYear="2018"
          physicalLabel={t("applications.nexusTimeline.physicalLabel")}
          economicLabel={t("applications.nexusTimeline.economicLabel")}
          caption={t("applications.nexusTimeline.caption")}
        />
        <SalesTaxMultiItemInvoiceBar
          title={t("applications.invoiceBar.title")}
          caption={t("applications.invoiceBar.caption")}
          taxAmount={9}
          taxLabel={t("applications.invoiceBar.taxLabel")}
          totalLabel={t("applications.invoiceBar.totalLabel")}
          items={[
            { key: "i1", label: t("applications.invoiceBar.item1"), amount: 40 },
            { key: "i2", label: t("applications.invoiceBar.item2"), amount: 35 },
            { key: "i3", label: t("applications.invoiceBar.item3"), amount: 25 },
          ]}
        />
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
