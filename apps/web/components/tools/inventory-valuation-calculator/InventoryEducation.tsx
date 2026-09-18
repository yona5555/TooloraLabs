import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import CostFlowDiagram from "./CostFlowDiagram";
import InventoryThreeMethodCompareBar from "./InventoryThreeMethodCompareBar";
import InventoryRisingPriceEffectDiagram from "./InventoryRisingPriceEffectDiagram";
import InventoryPurchaseBatchDiagram from "./InventoryPurchaseBatchDiagram";
import InventoryEndingUnitsGauge from "./InventoryEndingUnitsGauge";
import InventoryMethodValueLineChart from "./InventoryMethodValueLineChart";
import InventoryNoSalesConsistencyDonut from "./InventoryNoSalesConsistencyDonut";
import InventoryTaxImpactBar from "./InventoryTaxImpactBar";
import InventoryLowStockThresholdDiagram from "./InventoryLowStockThresholdDiagram";
import InventoryRawMaterialsFlowDiagram from "./InventoryRawMaterialsFlowDiagram";

type ExampleRow = { scenario: string; result: string };
type VariableItem = { name: string; description: string };
type ApplicationItem = { title: string; description: string };

export default async function InventoryEducation() {
  const t = await getTranslations("tools.inventory-valuation-calculator.education");

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
        <CostFlowDiagram
          fifoTitle={t("intro.diagram.fifoTitle")}
          lifoTitle={t("intro.diagram.lifoTitle")}
          oldestLabel={t("intro.diagram.oldestLabel")}
          newestLabel={t("intro.diagram.newestLabel")}
          outLabel={t("intro.diagram.outLabel")}
          caption={t("intro.diagram.caption")}
        />
        <InventoryThreeMethodCompareBar
          title={t("intro.threeMethodBar.title")}
          caption={t("intro.threeMethodBar.caption")}
          bars={[
            { key: "fifo", label: "FIFO", value: 64, colorClass: "fill-violet-500 dark:fill-violet-400" },
            { key: "wavg", label: t("intro.threeMethodBar.weightedAvg"), value: 52, colorClass: "fill-violet-400 dark:fill-violet-500" },
            { key: "lifo", label: "LIFO", value: 40, colorClass: "fill-violet-300 dark:fill-violet-600" },
          ]}
        />
        <InventoryRisingPriceEffectDiagram
          fifoLabel={t("intro.risingPriceDiagram.fifoLabel")}
          lifoLabel={t("intro.risingPriceDiagram.lifoLabel")}
          fifoTraits={t.raw("intro.risingPriceDiagram.fifoTraits") as string[]}
          lifoTraits={t.raw("intro.risingPriceDiagram.lifoTraits") as string[]}
          caption={t("intro.risingPriceDiagram.caption")}
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
        <InventoryPurchaseBatchDiagram
          title={t("variables.batchDiagram.title")}
          caption={t("variables.batchDiagram.caption")}
          fifoLabel={t("variables.batchDiagram.fifoLabel")}
          lifoLabel={t("variables.batchDiagram.lifoLabel")}
          batches={[
            { key: "b1", label: t("variables.batchDiagram.batch1"), qty: 10, unitCost: 5 },
            { key: "b2", label: t("variables.batchDiagram.batch2"), qty: 10, unitCost: 8 },
          ]}
        />
        <InventoryEndingUnitsGauge
          valueLabel="8"
          caption={t("variables.endingUnitsGauge.caption")}
          captionColorClass="text-emerald-600 dark:text-emerald-400"
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
        <InventoryMethodValueLineChart
          title={t("examples.valueLineChart.title")}
          caption={t("examples.valueLineChart.caption")}
          fifoLabel="FIFO"
          lifoLabel="LIFO"
          xLabel={t("examples.valueLineChart.xLabel")}
          fifoSeries={[
            { unitsSold: 0, value: 130 },
            { unitsSold: 4, value: 110 },
            { unitsSold: 8, value: 90 },
            { unitsSold: 10, value: 80 },
            { unitsSold: 12, value: 64 },
          ]}
          lifoSeries={[
            { unitsSold: 0, value: 130 },
            { unitsSold: 4, value: 98 },
            { unitsSold: 8, value: 66 },
            { unitsSold: 10, value: 50 },
            { unitsSold: 12, value: 40 },
          ]}
        />
        <InventoryNoSalesConsistencyDonut centerLabel={t("examples.consistencyDonut.centerLabel")} caption={t("examples.consistencyDonut.caption")} />
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
        <InventoryTaxImpactBar
          title={t("applications.taxImpactBar.title")}
          caption={t("applications.taxImpactBar.caption")}
          cogsLabel={t("applications.taxImpactBar.cogsLabel")}
          columns={[
            { key: "fifo", label: "FIFO", cogs: 66, colorClass: "fill-amber-400 dark:fill-amber-400/80" },
            { key: "lifo", label: "LIFO", cogs: 90, colorClass: "fill-amber-600 dark:fill-amber-300" },
          ]}
        />
        <InventoryLowStockThresholdDiagram
          currentLabel={t("applications.thresholdDiagram.currentLabel")}
          thresholdLabel={t("applications.thresholdDiagram.thresholdLabel")}
          caption={t("applications.thresholdDiagram.caption")}
        />
        <InventoryRawMaterialsFlowDiagram
          rawLabel={t("applications.rawMaterialsFlow.rawLabel")}
          logicLabel={t("applications.rawMaterialsFlow.logicLabel")}
          finishedLabel={t("applications.rawMaterialsFlow.finishedLabel")}
          caption={t("applications.rawMaterialsFlow.caption")}
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
