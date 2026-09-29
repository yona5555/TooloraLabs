import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import TriangleAngleGauge from "./TriangleAngleGauge";
import TriangleAngleSumDiagram from "./TriangleAngleSumDiagram";
import TriangleSolvingTimeline from "./TriangleSolvingTimeline";
import TriangleInteractivePlayground from "./TriangleInteractivePlayground";
import TriangleSideLengthChart from "./TriangleSideLengthChart";
import TriangleAltitudesBarList from "./TriangleAltitudesBarList";
import TriangleHeronFormulaDiagram from "./TriangleHeronFormulaDiagram";
import TrianglePerimeterStackedBar from "./TrianglePerimeterStackedBar";
import TriangleCompactnessZoneStrip from "./TriangleCompactnessZoneStrip";
import TriangleLawOfSinesRatioBars from "./TriangleLawOfSinesRatioBars";
import TriangleAngleDragSensitivity from "./TriangleAngleDragSensitivity";
import TriangleRadiiComparisonCards from "./TriangleRadiiComparisonCards";
import TriangleAngleReferenceDrag from "./TriangleAngleReferenceDrag";
import TriangleSpecialTypesTable from "./TriangleSpecialTypesTable";
import TriangleUnitConversionEquivalence from "./TriangleUnitConversionEquivalence";

type ExampleRow = { calculation: string; result: string };
type ModeItem = { title: string; description: string };

export default async function TriangleEducation() {
  const t = await getTranslations("tools.triangle-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const modeItems = t.raw("modes.items") as ModeItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      {/* The page's drag-interactive (Mafs) indicators stay grouped here, at the top — none of
          them relocated as part of distributing the other twelve, static-once-laid-out
          indicators across the encyclopedic content below. */}
      <TriangleInteractivePlayground />
      <TriangleAngleGauge />
      <TriangleAngleDragSensitivity />
      <TriangleAngleReferenceDrag />

      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
        <TriangleAngleSumDiagram />
        <TriangleSpecialTypesTable />
      </InfoSection>

      <InfoSection title={t("modes.title")}>
        <p>{t("modes.intro")}</p>
        <div className="space-y-4">
          {modeItems.map((item) => (
            <div key={item.title}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <TriangleSolvingTimeline />
          <TriangleLawOfSinesRatioBars />
        </div>
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
                  <td className="px-3 py-2.5 font-semibold">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-6">
          <TriangleSideLengthChart />
          <TrianglePerimeterStackedBar />
          <TriangleHeronFormulaDiagram />
          <TriangleAltitudesBarList />
        </div>
      </InfoSection>

      <InfoSection title={t("deeperProperties.title")}>
        <p>{t("deeperProperties.intro")}</p>
        <div className="space-y-6">
          <TriangleCompactnessZoneStrip />
          <TriangleRadiiComparisonCards />
        </div>
      </InfoSection>

      {/* §8.7: leaderboard placement is a manual, per-tool editorial decision — two
          well-spaced positions, matching the site's established precedent (e.g. BMI:
          after the solved/worked content, and after Behind the Tool), not one ad per
          redistributed indicator. */}
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
        <TriangleUnitConversionEquivalence />
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
