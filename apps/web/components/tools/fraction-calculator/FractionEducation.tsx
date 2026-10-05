import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import { GlassPage, GlassIndicatorGrid } from "@/components/tool-ui/glass/GlassPrimitives";
import FractionHero from "./FractionHero";
import FractionRingsCard from "./FractionRingsCard";
import FractionCommonGridCard from "./FractionCommonGridCard";
import FractionWallCard from "./FractionWallCard";
import FractionAreaModelCard from "./FractionAreaModelCard";
import FractionPercentWaffleCard from "./FractionPercentWaffleCard";
import FractionGcdTilingCard from "./FractionGcdTilingCard";
import FractionDivisionTapeCard from "./FractionDivisionTapeCard";
import FractionMixedNumberCard from "./FractionMixedNumberCard";
import FractionLcdLadderCard from "./FractionLcdLadderCard";
import FractionDecimalExpansionCard from "./FractionDecimalExpansionCard";
import FractionEquivalentLineCard from "./FractionEquivalentLineCard";
import FractionContributionCard from "./FractionContributionCard";
import FractionBenchmarkGaugeCard from "./FractionBenchmarkGaugeCard";
import FractionCrossMultiplyCard from "./FractionCrossMultiplyCard";
import FractionSensitivityCard from "./FractionSensitivityCard";

type ExampleRow = { calculation: string; result: string };

/**
 * Indicators are scattered through the article beside the text sections they illustrate (§37),
 * never gathered into one contiguous block. Placement is STRUCTURAL (anchored to which
 * paragraph/section each group sits after, not to any translated string), so the order is
 * identical in all 6 locales including Arabic RTL. Never more than 2 indicator cards appear back
 * to back: every group below is preceded by a real paragraph/section or an AdSpace (AdSpace
 * doubles as a plain separator between groups where no further new paragraph exists to anchor to
 * -- adding new article copy isn't in scope here).
 *   02 rings, 04 wall        -> intro paragraph 1 (what a fraction is, proper/improper/mixed)
 *   09 mixed, 03 common-grid -> intro paragraph 2 (add/subtract need a common denominator)
 *   10 lcd, 05 area model    -> same paragraph (multiplication), via an AdSpace separator
 *   08 tape, 07 gcd tiling   -> same paragraph (division, reduced to simplest form), via AdSpace
 *   11 decimal, 12 equiv.    -> intro paragraph 3 (exact fractions avoid rounding errors)
 *   06 waffle, 14 gauge      -> worked examples
 *   13 contribution, 15 x-   -> worked examples (comparison), via an AdSpace separator
 *   16 sensitivity           -> last third of the page, after behind-the-tool
 */
export default async function FractionEducation() {
  const t = await getTranslations("tools.fraction-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <GlassPage>
      <FractionHero />

      <EncyclopediaPaper>
        <InfoSection title={t("intro.title")}>
          <p>{t("intro.paragraph1")}</p>
          <GlassIndicatorGrid>
            <FractionRingsCard />
            <FractionWallCard />
          </GlassIndicatorGrid>

          <p>{t("intro.paragraph2")}</p>
          <GlassIndicatorGrid>
            <FractionMixedNumberCard />
            <FractionCommonGridCard />
          </GlassIndicatorGrid>

          <AdSpace variant="leaderboard" />

          <GlassIndicatorGrid>
            <FractionLcdLadderCard />
            <FractionAreaModelCard />
          </GlassIndicatorGrid>

          <AdSpace variant="leaderboard" />

          <GlassIndicatorGrid>
            <FractionDivisionTapeCard />
            <FractionGcdTilingCard />
          </GlassIndicatorGrid>

          <p>{t("intro.paragraph3")}</p>
          <GlassIndicatorGrid>
            <FractionDecimalExpansionCard />
            <FractionEquivalentLineCard />
          </GlassIndicatorGrid>
        </InfoSection>

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
                    <td className="px-3 py-2.5 font-mono font-semibold">{row.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <GlassIndicatorGrid>
            <FractionPercentWaffleCard />
            <FractionBenchmarkGaugeCard />
          </GlassIndicatorGrid>

          <AdSpace variant="leaderboard" />

          <GlassIndicatorGrid>
            <FractionContributionCard />
            <FractionCrossMultiplyCard />
          </GlassIndicatorGrid>
        </InfoSection>

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

        <GlassIndicatorGrid>
          <FractionSensitivityCard />
        </GlassIndicatorGrid>

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
    </GlassPage>
  );
}
