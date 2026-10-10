import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import SectionCard from "@/components/tool-ui/SectionCard";
import ProbabilityLive3D from "./ProbabilityLive3D";
import ProbabilityVennLab from "./ProbabilityVennLab";
import ProbabilityChanceGauge from "./ProbabilityChanceGauge";
import ProbabilityEquivalence from "./ProbabilityEquivalence";
import ProbabilityRarityLogScale from "./ProbabilityRarityLogScale";
import ProbabilityTreeFlow from "./ProbabilityTreeFlow";
import ProbabilityIndependenceBalance from "./ProbabilityIndependenceBalance";
import ProbabilityRegionStackedBar from "./ProbabilityRegionStackedBar";
import ProbabilityRankedEvents from "./ProbabilityRankedEvents";
import ProbabilityFormulaDiagram from "./ProbabilityFormulaDiagram";
import ProbabilityMonteCarlo from "./ProbabilityMonteCarlo";
import ProbabilityBinomialBars from "./ProbabilityBinomialBars";
import ProbabilityTrialsStepped from "./ProbabilityTrialsStepped";

type ExampleRow = { calculation: string; result: string };
type ModeItem = { title: string; description: string };

/** Indicators placed under each mode's explanation (single, and, or, conditional), in that order. */
const MODE_INDICATORS = [
  [<ProbabilityChanceGauge key="g" />, <ProbabilityEquivalence key="e" />, <ProbabilityRarityLogScale key="r" />],
  [<ProbabilityTreeFlow key="t" />, <ProbabilityIndependenceBalance key="b" />],
  [<ProbabilityRegionStackedBar key="s" />, <ProbabilityRankedEvents key="k" />],
  [<ProbabilityFormulaDiagram key="f" />],
];

export default async function ProbabilityEducation() {
  const t = await getTranslations("tools.probability-calculator.education");
  const t3 = await getTranslations("tools.probability-calculator.live3d");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const modeItems = t.raw("modes.items") as ModeItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <SectionCard title={t3("cardTitle")}>
          <ProbabilityLive3D />
        </SectionCard>
        <p>{t("intro.paragraph2")}</p>
        <ProbabilityVennLab />
      </InfoSection>

      <InfoSection title={t("modes.title")}>
        <p>{t("modes.intro")}</p>
        <div className="space-y-4">
          {modeItems.map((item, i) => (
            <div key={item.title}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1">{item.description}</p>
              {MODE_INDICATORS[i] && <div className="mt-4 space-y-6">{MODE_INDICATORS[i]}</div>}
            </div>
          ))}
        </div>
      </InfoSection>

      <AdSpace variant="leaderboard" />

      <InfoSection title={t("examples.title")}>
        <p>{t("examples.intro")}</p>
        <div dir="ltr" className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-current/30 text-start">
                <th className="px-3 py-2 text-start font-semibold">{t("examples.columnCalculation")}</th>
                <th className="px-3 py-2 text-start font-semibold">{t("examples.columnResult")}</th>
              </tr>
            </thead>
            <tbody>
              {exampleRows.map((row) => (
                <tr key={row.calculation} className="border-b border-current/10">
                  <td className="px-3 py-2.5">{row.calculation}</td>
                  <td className="px-3 py-2.5 font-semibold">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-6">
          <ProbabilityMonteCarlo />
          <ProbabilityBinomialBars />
          <ProbabilityTrialsStepped />
        </div>
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
