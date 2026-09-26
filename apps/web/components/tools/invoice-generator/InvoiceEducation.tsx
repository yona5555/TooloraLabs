import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import SectionCard from "@/components/tool-ui/SectionCard";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
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
  const tRoot = await getTranslations("tools.invoice-generator");

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
              indicator={
                <InvoiceFlowDiagram
                  subtotalLabel={t("intro.diagram.subtotalLabel")}
                  discountLabel={t("intro.diagram.discountLabel")}
                  taxLabel={t("intro.diagram.taxLabel")}
                  totalLabel={t("intro.diagram.totalLabel")}
                />
              }
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("intro.diagram.subtotalLabel"), value: "$650.00" },
                { label: t("intro.diagram.discountLabel"), value: "-$130.00" },
                { label: t("intro.diagram.taxLabel"), value: "+$78.00" },
                { label: t("intro.diagram.totalLabel"), value: "$598.00", emphasize: true },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title={t("intro.net30Diagram.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro.net30Diagram.caption")}</p>
          <div className="mt-4">
            <IndicatorWithTable
              indicator={
                <InvoiceNet30TimelineDiagram
                  issueLabel={t("intro.net30Diagram.issueLabel")}
                  dueLabel={t("intro.net30Diagram.dueLabel")}
                  creditPeriodLabel={t("intro.net30Diagram.creditPeriodLabel")}
                />
              }
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("intro.net30Diagram.issueLabel"), value: "Mar 1" },
                { label: t("intro.net30Diagram.dueLabel"), value: "Mar 31" },
                { label: "Net", value: "30 days", emphasize: true },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title={t("intro.twoExamplesBar.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro.twoExamplesBar.caption")}</p>
          <div className="mt-4">
            <IndicatorWithTable
              indicator={
                <InvoiceTwoExamplesCompareBar
                  title={t("intro.twoExamplesBar.title")}
                  taxLabel={t("intro.twoExamplesBar.taxLabel")}
                  examples={[
                    { key: "ex1", label: t("intro.twoExamplesBar.label1"), taxable: 520, tax: 78 },
                    { key: "ex2", label: t("intro.twoExamplesBar.label2"), taxable: 800, tax: 80 },
                  ]}
                />
              }
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("intro.twoExamplesBar.label1"), value: "$598.00" },
                { label: t("intro.twoExamplesBar.label2"), value: "$880.00" },
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

        <SectionCard title={t("variables.lineItemDiagram.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("variables.lineItemDiagram.caption")}</p>
          <div className="mt-4">
            <IndicatorWithTable
              indicator={
                <InvoiceLineItemQtyPriceDiagram
                  title={t("variables.lineItemDiagram.title")}
                  items={[
                    { key: "design", label: t("variables.lineItemDiagram.item1"), qty: 10, unitPrice: 50 },
                    { key: "hosting", label: t("variables.lineItemDiagram.item2"), qty: 1, unitPrice: 20 },
                  ]}
                />
              }
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("variables.lineItemDiagram.item1"), value: "10 × $50.00 = $500.00" },
                { label: t("variables.lineItemDiagram.item2"), value: "1 × $20.00 = $20.00" },
                { label: "Subtotal", value: "$520.00", emphasize: true },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title={t("variables.discountGauge.title")}>
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{t("variables.discountGauge.caption")}</p>
          <div className="mt-4">
            <IndicatorWithTable
              indicator={<InvoiceDiscountRateGauge valueLabel="20%" />}
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: "None", value: "0–5%" },
                { label: "Modest", value: "5–15%" },
                { label: "Notable", value: "15–25%" },
                { label: "Steep", value: "25–30%" },
                { label: "This example", value: "20%", emphasize: true },
              ]}
            />
          </div>
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

        <SectionCard title={t("examples.breakdownDonut.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("examples.breakdownDonut.caption")}</p>
          <div className="mt-4">
            <IndicatorWithTable
              indicator={
                <InvoiceExampleBreakdownDonut
                  centerValue="$880"
                  centerLabel={t("examples.breakdownDonut.centerLabel")}
                  segments={[
                    { key: "taxable", value: 800, label: t("examples.breakdownDonut.taxable"), colorClass: "stroke-rose-500 dark:stroke-rose-400" },
                    { key: "tax", value: 80, label: t("examples.breakdownDonut.tax"), colorClass: "stroke-amber-500 dark:stroke-amber-400" },
                  ]}
                />
              }
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("examples.breakdownDonut.taxable"), value: "$800.00" },
                { label: t("examples.breakdownDonut.tax"), value: "$80.00" },
                { label: t("examples.breakdownDonut.centerLabel"), value: "$880.00", emphasize: true },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title={t("examples.lineBreakdownBar.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("examples.lineBreakdownBar.caption")}</p>
          <div className="mt-4">
            <IndicatorWithTable
              indicator={
                <InvoiceExampleLineBreakdownBar
                  taxAmount={78}
                  taxLabel={t("examples.lineBreakdownBar.taxLabel")}
                  totalLabel={t("examples.lineBreakdownBar.totalLabel")}
                  items={[
                    { key: "design", label: t("examples.lineBreakdownBar.item1"), amount: 500 },
                    { key: "hosting", label: t("examples.lineBreakdownBar.item2"), amount: 20 },
                  ]}
                />
              }
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("examples.lineBreakdownBar.item1"), value: "$500.00" },
                { label: t("examples.lineBreakdownBar.item2"), value: "$20.00" },
                { label: t("examples.lineBreakdownBar.taxLabel"), value: "$78.00" },
                { label: t("examples.lineBreakdownBar.totalLabel"), value: "$598.00", emphasize: true },
              ]}
            />
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

        <SectionCard title={t("applications.recurringChart.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("applications.recurringChart.caption")}</p>
          <div className="mt-4">
            <IndicatorWithTable
              indicator={
                <InvoiceRecurringBillingLineChart
                  title={t("applications.recurringChart.title")}
                  points={[
                    { key: "m1", label: t("applications.recurringChart.month1"), total: 598 },
                    { key: "m2", label: t("applications.recurringChart.month2"), total: 598 },
                    { key: "m3", label: t("applications.recurringChart.month3"), total: 598 },
                    { key: "m4", label: t("applications.recurringChart.month4"), total: 598 },
                  ]}
                />
              }
              workedExampleTitle={tRoot("workedExampleTitle")}
              rows={[
                { label: t("applications.recurringChart.month1"), value: "$598.00" },
                { label: t("applications.recurringChart.month4"), value: "$598.00" },
                { label: "4-month total", value: "$2,392.00", emphasize: true },
              ]}
            />
          </div>
        </SectionCard>

        {/* Country names here are real regulatory facts (which jurisdictions legally mandate
            structured e-invoicing), not decorative "flavor" content — the same category as
            Sales Tax Calculator's nexus case law and state tax rates, kept intact for the
            same reason. */}
        <SectionCard title={t("applications.ublDiagram.title")}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("applications.ublDiagram.caption")}</p>
          <div className="mt-4">
            <InvoiceUblAdoptionDiagram regions={["EU", "Turkey", "Peru", "Colombia", "Panama"]} mandatedLabel={t("applications.ublDiagram.mandatedLabel")} />
          </div>
        </SectionCard>

        <SectionCard title={t("applications.quoteVsInvoice.title")}>
          <InvoiceQuoteVsInvoiceDiagram
            quoteLabel={t("applications.quoteVsInvoice.quoteLabel")}
            invoiceLabel={t("applications.quoteVsInvoice.invoiceLabel")}
            quoteTraits={t.raw("applications.quoteVsInvoice.quoteTraits") as string[]}
            invoiceTraits={t.raw("applications.quoteVsInvoice.invoiceTraits") as string[]}
            caption={t("applications.quoteVsInvoice.caption")}
          />
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
