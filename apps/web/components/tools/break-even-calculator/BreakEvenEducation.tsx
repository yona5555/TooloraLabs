import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import BreakEvenWorkedExampleTable from "./BreakEvenWorkedExampleTable";
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
        <BreakEvenBusinessTypeDiagram
          softwareLabel={t("intro.businessTypeDiagram.softwareLabel")}
          lowMarginLabel={t("intro.businessTypeDiagram.lowMarginLabel")}
          softwareTraits={t.raw("intro.businessTypeDiagram.softwareTraits") as string[]}
          lowMarginTraits={t.raw("intro.businessTypeDiagram.lowMarginTraits") as string[]}
          caption={t("intro.businessTypeDiagram.caption")}
        />
        <BreakEvenRevenueDonut
          centerValue="$50"
          centerLabel={t("intro.marginBar.priceLabel")}
          caption={t("intro.marginBar.caption")}
          segments={[
            { key: "variable", value: 20, label: t("intro.marginBar.variableCostLabel"), colorClass: "stroke-teal-300 dark:stroke-teal-600" },
            { key: "margin", value: 30, label: t("intro.marginBar.marginLabel"), colorClass: "stroke-teal-600 dark:stroke-teal-400" },
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
        {/* Both charts capped to the same max-width and placed side by side, rather than each
            stretching to its own full container width — BreakEvenTwoScenarioCompareBar's fixed
            280-wide viewBox scaled up to fill an arbitrarily wide card (growing its bars and text
            along with it) sitting right above BreakEvenRevenueDonut's fixed 160px circle read as
            two mismatched, unrelated pieces rather than one section. */}
        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2">
          <div className="mx-auto w-full max-w-xs">
            <BreakEvenTwoScenarioCompareBar
              title={t("examples.scenarioCompareBar.title")}
              caption={t("examples.scenarioCompareBar.caption")}
              scenarios={[
                { key: "s1", label: t("examples.scenarioCompareBar.label1"), units: 334 },
                { key: "s2", label: t("examples.scenarioCompareBar.label2"), units: 500 },
              ]}
            />
          </div>
          <div className="mx-auto w-full max-w-xs">
            <BreakEvenRevenueDonut
              centerValue="$25,000"
              centerLabel={t("examples.revenueDonut.centerLabel")}
              caption={t("examples.revenueDonut.caption")}
              segments={[
                { key: "fixed", value: 10000, label: t("examples.revenueDonut.fixed"), colorClass: "stroke-rose-500 dark:stroke-rose-400" },
                { key: "variable", value: 10000, label: t("examples.revenueDonut.variable"), colorClass: "stroke-amber-500 dark:stroke-amber-400" },
                { key: "profit", value: 5000, label: t("examples.revenueDonut.profit"), colorClass: "stroke-emerald-500 dark:stroke-emerald-400" },
              ]}
            />
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
        <BreakEvenPriceChangeImpactBar
          title={t("applications.priceImpactBar.title")}
          caption={t("applications.priceImpactBar.caption")}
          scenarios={[
            { key: "p50", label: "$50", units: 334 },
            { key: "p55", label: "$55", units: 286 },
          ]}
        />
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
