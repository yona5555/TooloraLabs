import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import InvoiceFlowDiagram from "./InvoiceFlowDiagram";
import InvoiceNet30TimelineDiagram from "./InvoiceNet30TimelineDiagram";
import InvoiceTwoExamplesCompareBar from "./InvoiceTwoExamplesCompareBar";
import InvoiceLineItemQtyPriceDiagram from "./InvoiceLineItemQtyPriceDiagram";
import InvoiceDiscountRateGauge from "./InvoiceDiscountRateGauge";
import InvoiceExampleBreakdownDonut from "./InvoiceExampleBreakdownDonut";
import InvoiceExampleLineBreakdownBar from "./InvoiceExampleLineBreakdownBar";
import InvoiceRecurringBillingLineChart from "./InvoiceRecurringBillingLineChart";
import InvoiceUblAdoptionDiagram from "./InvoiceUblAdoptionDiagram";
import InvoiceQuoteVsInvoiceDiagram from "./InvoiceQuoteVsInvoiceDiagram";

type ExampleRow = { scenario: string; result: string };
type VariableItem = { name: string; description: string };
type ApplicationItem = { title: string; description: string };

export default async function InvoiceEducation() {
  const t = await getTranslations("tools.invoice-generator.education");

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
        <InvoiceFlowDiagram
          subtotalLabel={t("intro.diagram.subtotalLabel")}
          discountLabel={t("intro.diagram.discountLabel")}
          taxLabel={t("intro.diagram.taxLabel")}
          totalLabel={t("intro.diagram.totalLabel")}
          caption={t("intro.diagram.caption")}
        />
        <InvoiceNet30TimelineDiagram
          issueLabel={t("intro.net30Diagram.issueLabel")}
          dueLabel={t("intro.net30Diagram.dueLabel")}
          creditPeriodLabel={t("intro.net30Diagram.creditPeriodLabel")}
          caption={t("intro.net30Diagram.caption")}
        />
        <InvoiceTwoExamplesCompareBar
          title={t("intro.twoExamplesBar.title")}
          taxLabel={t("intro.twoExamplesBar.taxLabel")}
          caption={t("intro.twoExamplesBar.caption")}
          examples={[
            { key: "ex1", label: t("intro.twoExamplesBar.label1"), taxable: 520, tax: 78 },
            { key: "ex2", label: t("intro.twoExamplesBar.label2"), taxable: 800, tax: 80 },
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
        <InvoiceLineItemQtyPriceDiagram
          title={t("variables.lineItemDiagram.title")}
          lineTotalLabel={t("variables.lineItemDiagram.lineTotalLabel")}
          caption={t("variables.lineItemDiagram.caption")}
          items={[
            { key: "design", label: t("variables.lineItemDiagram.item1"), qty: 10, unitPrice: 50 },
            { key: "hosting", label: t("variables.lineItemDiagram.item2"), qty: 1, unitPrice: 20 },
          ]}
        />
        <InvoiceDiscountRateGauge
          valueLabel="20%"
          caption={t("variables.discountGauge.caption")}
          captionColorClass="fill-amber-600 dark:fill-amber-400"
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
        <InvoiceExampleBreakdownDonut
          centerValue="$880"
          centerLabel={t("examples.breakdownDonut.centerLabel")}
          caption={t("examples.breakdownDonut.caption")}
          segments={[
            { key: "taxable", value: 800, label: t("examples.breakdownDonut.taxable"), colorClass: "stroke-rose-500 dark:stroke-rose-400" },
            { key: "tax", value: 80, label: t("examples.breakdownDonut.tax"), colorClass: "stroke-amber-500 dark:stroke-amber-400" },
          ]}
        />
        <InvoiceExampleLineBreakdownBar
          title={t("examples.lineBreakdownBar.title")}
          caption={t("examples.lineBreakdownBar.caption")}
          taxAmount={78}
          taxLabel={t("examples.lineBreakdownBar.taxLabel")}
          totalLabel={t("examples.lineBreakdownBar.totalLabel")}
          items={[
            { key: "design", label: t("examples.lineBreakdownBar.item1"), amount: 500 },
            { key: "hosting", label: t("examples.lineBreakdownBar.item2"), amount: 20 },
          ]}
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
        <InvoiceRecurringBillingLineChart
          title={t("applications.recurringChart.title")}
          caption={t("applications.recurringChart.caption")}
          points={[
            { key: "m1", label: t("applications.recurringChart.month1"), total: 598 },
            { key: "m2", label: t("applications.recurringChart.month2"), total: 598 },
            { key: "m3", label: t("applications.recurringChart.month3"), total: 598 },
            { key: "m4", label: t("applications.recurringChart.month4"), total: 598 },
          ]}
        />
        <InvoiceUblAdoptionDiagram
          regions={["EU", "Turkey", "Peru", "Colombia", "Panama"]}
          mandatedLabel={t("applications.ublDiagram.mandatedLabel")}
          caption={t("applications.ublDiagram.caption")}
        />
        <InvoiceQuoteVsInvoiceDiagram
          quoteLabel={t("applications.quoteVsInvoice.quoteLabel")}
          invoiceLabel={t("applications.quoteVsInvoice.invoiceLabel")}
          quoteTraits={t.raw("applications.quoteVsInvoice.quoteTraits") as string[]}
          invoiceTraits={t.raw("applications.quoteVsInvoice.invoiceTraits") as string[]}
          caption={t("applications.quoteVsInvoice.caption")}
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
