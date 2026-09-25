import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import SectionCard from "@/components/tool-ui/SectionCard";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import BreakEvenWorkedExampleTable from "./BreakEvenWorkedExampleTable";
import BreakEvenWorkedExampleNote from "./BreakEvenWorkedExampleNote";
import BreakEvenBusinessTypeDiagram from "./BreakEvenBusinessTypeDiagram";
import BreakEvenMarginRatioGauge from "./BreakEvenMarginRatioGauge";
import BreakEvenFixedCostAccumulationDiagram from "./BreakEvenFixedCostAccumulationDiagram";
import BreakEvenTwoScenarioCompareBar from "./BreakEvenTwoScenarioCompareBar";
import BreakEvenRevenueDonut from "./BreakEvenRevenueDonut";
import BreakEvenPriceChangeImpactBar from "./BreakEvenPriceChangeImpactBar";
import BreakEvenMonthlyPaceLineChart from "./BreakEvenMonthlyPaceLineChart";
import BreakEvenFixedCostAdditionDiagram from "./BreakEvenFixedCostAdditionDiagram";

type ExampleRow = { scenario: string; result: string };
type VariableItem = { name: string; description: string };
type ApplicationItem = { title: string; description: string };

export default async function BreakEvenEducation() {
  const t = await getTranslations("tools.break-even-calculator.education");
  const tRoot = await getTranslations("tools.break-even-calculator");

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
        {/* This table needs its own signpost — without a heading + intro sentence it reads as a
            stray fragment when scrolled past, easy to mistake for an unlabeled continuation of
            the donut section further down. Its own angle (cost/revenue vs. sales VOLUME) is
            explicitly distinguished here from the donut's angle (how one $50 sale's price
            splits into cost + margin) per §32's "no duplicated/overlapping sections" rule. */}
        <h3 className="mt-2 font-semibold">{t("intro.diagram.title")}</h3>
        <p className="text-sm opacity-80">{t("intro.diagram.intro")}</p>
        <BreakEvenWorkedExampleTable
          columns={[t("intro.diagram.columnUnits"), t("intro.diagram.totalCostLabel"), t("intro.diagram.revenueLabel"), t("intro.diagram.columnResult")]}
          rows={[
            ["0", "$10,000", "$0", { text: t("intro.diagram.statusLoss"), kind: "loss" }],
            ["167", "$13,340", "$8,350", { text: t("intro.diagram.statusLoss"), kind: "loss" }],
            ["334", "$16,680", "$16,700", { text: t("intro.diagram.statusBreakeven"), kind: "breakeven" }],
            ["500", "$20,000", "$25,000", { text: t("intro.diagram.statusProfit"), kind: "profit" }],
          ]}
          caption={t("intro.diagram.caption")}
        />
        {/* Distinct hypothetical businesses (not this page's $10,000/$20/$50 running example),
            so their break-even/profit-at-scale numbers below don't duplicate any figure shown
            elsewhere on the page — each card now carries its own real computed indicator instead
            of narrative bullets alone, per §32's extension. */}
        <BreakEvenBusinessTypeDiagram
          softwareLabel={t("intro.businessTypeDiagram.softwareLabel")}
          lowMarginLabel={t("intro.businessTypeDiagram.lowMarginLabel")}
          softwareTraits={t.raw("intro.businessTypeDiagram.softwareTraits") as string[]}
          lowMarginTraits={t.raw("intro.businessTypeDiagram.lowMarginTraits") as string[]}
          statsTitle={tRoot("workedExampleTitle")}
          softwareStats={[
            { label: t("intro.businessTypeDiagram.fixedCostsLabel"), value: "$45,000" },
            { label: t("intro.businessTypeDiagram.marginPerUnitLabel"), value: "$90" },
            { label: t("intro.businessTypeDiagram.breakEvenUnitsLabel"), value: "500", emphasize: true },
            { label: t("intro.businessTypeDiagram.profitAtUnitsLabel", { units: "2,000" }), value: "$135,000" },
          ]}
          lowMarginStats={[
            { label: t("intro.businessTypeDiagram.fixedCostsLabel"), value: "$2,000" },
            { label: t("intro.businessTypeDiagram.marginPerUnitLabel"), value: "$2" },
            { label: t("intro.businessTypeDiagram.breakEvenUnitsLabel"), value: "1,000", emphasize: true },
            { label: t("intro.businessTypeDiagram.profitAtUnitsLabel", { units: "2,000" }), value: "$2,000" },
          ]}
          caption={t("intro.businessTypeDiagram.caption")}
        />
        {/* Same full-framed-card structure as fuel-cost-calculator's "Cost by Power Source"
            section (SectionCard: rounded border + blue header bar + white bold title) — an
            "indicator + WORKED EXAMPLE table" pair is never left floating with no container or
            heading of its own, per §32. */}
        <SectionCard title={t("intro.marginBar.cardTitle")}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="shrink-0">
              <BreakEvenRevenueDonut
                ariaLabel={t("intro.marginBar.title")}
                segments={[
                  { key: "variable", value: 20, label: t("intro.marginBar.variableCostLabel"), formatted: "$20", colorClass: "stroke-teal-300 dark:stroke-teal-600", dotColorClass: "bg-teal-300 dark:bg-teal-600" },
                  { key: "margin", value: 30, label: t("intro.marginBar.marginLabel"), formatted: "$30", colorClass: "stroke-teal-600 dark:stroke-teal-400", dotColorClass: "bg-teal-600 dark:bg-teal-400" },
                ]}
              />
            </div>
            <BreakEvenWorkedExampleNote
              title={tRoot("workedExampleTitle")}
              rows={[
                { label: t("intro.marginBar.priceLabel"), value: "$50" },
                { label: t("intro.marginBar.variableCostLabel"), value: "$20" },
                { label: t("intro.marginBar.marginLabel"), value: "$30", emphasize: true, note: t("intro.marginBar.marginPercentNote", { percent: "60%" }) },
              ]}
            />
          </div>
          <p className="mt-3 text-xs opacity-60">{t("intro.marginBar.caption")}</p>
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
        <BreakEvenMarginRatioGauge
          valueLabel="60%"
          caption={t("variables.marginGauge.caption")}
          captionColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <BreakEvenFixedCostAccumulationDiagram
          columnUnits={t("variables.accumulationDiagram.columnUnits")}
          columnCumulativeMargin={t("variables.accumulationDiagram.columnCumulativeMargin")}
          columnResult={t("variables.accumulationDiagram.columnResult")}
          breakEvenLabel={t("variables.accumulationDiagram.breakEvenLabel")}
          caption={t("variables.accumulationDiagram.caption")}
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
        {/* Same reference flex-row pattern as the $50-price section above (and the same
            fuel-cost-calculator layout both are modeled on): both pieces shrink-0 at a
            consistent, capped medium width, centered together — not two independently-scaled
            charts stacked with mismatched effective sizes. */}
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-center">
          <div className="w-full max-w-xs shrink-0">
            <BreakEvenTwoScenarioCompareBar
              title={t("examples.scenarioCompareBar.title")}
              caption={t("examples.scenarioCompareBar.caption")}
              scenarios={[
                { key: "s1", label: t("examples.scenarioCompareBar.label1"), units: 334 },
                { key: "s2", label: t("examples.scenarioCompareBar.label2"), units: 500 },
              ]}
            />
          </div>
          <div className="shrink-0">
            <BreakEvenRevenueDonut
              ariaLabel={t("examples.revenueDonut.centerLabel")}
              segments={[
                { key: "fixed", value: 10000, label: t("examples.revenueDonut.fixed"), formatted: "$10,000", colorClass: "stroke-rose-500 dark:stroke-rose-400", dotColorClass: "bg-rose-500 dark:bg-rose-400" },
                { key: "variable", value: 10000, label: t("examples.revenueDonut.variable"), formatted: "$10,000", colorClass: "stroke-amber-500 dark:stroke-amber-400", dotColorClass: "bg-amber-500 dark:bg-amber-400" },
                { key: "profit", value: 5000, label: t("examples.revenueDonut.profit"), formatted: "$5,000", colorClass: "stroke-emerald-500 dark:stroke-emerald-400", dotColorClass: "bg-emerald-500 dark:bg-emerald-400" },
              ]}
            />
            <p className="mt-2 text-center text-xs opacity-70">{t("examples.revenueDonut.caption")}</p>
          </div>
        </div>
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
        {/* Same full-framed-card structure as the $50-price section above and the
            fuel-cost-calculator reference — the bar chart capped to a medium max-width (it was
            previously alone at full card width, scaling its bars and numbers up well past every
            other indicator's size on this page) with a real worked-example note beside it. */}
        <SectionCard title={t("applications.priceImpactBar.cardTitle")}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="w-full max-w-xs shrink-0">
              <BreakEvenPriceChangeImpactBar
                title={t("applications.priceImpactBar.title")}
                scenarios={[
                  { key: "p50", label: "$50", units: 334 },
                  { key: "p55", label: "$55", units: 286 },
                ]}
              />
            </div>
            <BreakEvenWorkedExampleNote
              title={tRoot("workedExampleTitle")}
              rows={[
                { label: t("applications.priceImpactBar.rowLabelAt", { price: "$50" }), value: "334" },
                {
                  label: t("applications.priceImpactBar.rowLabelAt", { price: "$55" }),
                  value: "286",
                  emphasize: true,
                  note: t("applications.priceImpactBar.noteFewerUnits", { count: 48 }),
                },
              ]}
            />
          </div>
          <p className="mt-3 text-xs opacity-60">{t("applications.priceImpactBar.caption")}</p>
        </SectionCard>
        <BreakEvenMonthlyPaceLineChart
          breakEvenLabel={t("applications.monthlyPaceChart.breakEvenLabel")}
          columnMonth={t("applications.monthlyPaceChart.columnMonth")}
          columnCumulativeUnits={t("applications.monthlyPaceChart.columnCumulativeUnits")}
          columnPercentOfBreakEven={t("applications.monthlyPaceChart.columnPercentOfBreakEven")}
          caption={t("applications.monthlyPaceChart.caption")}
          points={[
            { key: "m1", label: t("applications.monthlyPaceChart.month1"), cumulativeUnits: 84 },
            { key: "m2", label: t("applications.monthlyPaceChart.month2"), cumulativeUnits: 167 },
            { key: "m3", label: t("applications.monthlyPaceChart.month3"), cumulativeUnits: 251 },
            { key: "m4", label: t("applications.monthlyPaceChart.month4"), cumulativeUnits: 334 },
          ]}
        />
        <BreakEvenFixedCostAdditionDiagram
          beforeLabel={t("applications.fixedCostAddition.beforeLabel")}
          afterLabel={t("applications.fixedCostAddition.afterLabel")}
          columnFixedCosts={t("applications.fixedCostAddition.columnFixedCosts")}
          columnBreakEvenUnits={t("applications.fixedCostAddition.columnBreakEvenUnits")}
          caption={t("applications.fixedCostAddition.caption")}
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
