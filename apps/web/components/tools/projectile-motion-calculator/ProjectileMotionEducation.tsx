import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import TrajectoryDiagram from "./TrajectoryDiagram";
import ProjectileRangeVsAngleDiagram from "./ProjectileRangeVsAngleDiagram";
import ProjectileVelocityComponentsDiagram from "./ProjectileVelocityComponentsDiagram";
import ProjectileImpactVelocityDiagram from "./ProjectileImpactVelocityDiagram";
import ProjectileGravityComparisonDiagram from "./ProjectileGravityComparisonDiagram";

type ExampleRow = { calculation: string; result: string };

export default async function ProjectileMotionEducation() {
  const t = await getTranslations("tools.projectile-motion-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <TrajectoryDiagram
          speed={20}
          angle={45}
          height={0}
          gravity={9.81}
          timeOfFlight={2.884}
          maxHeight={10.19}
          range={40.77}
          launchLabel={t("intro.diagram.launchLabel")}
          peakLabel={t("intro.diagram.peakLabel")}
          landingLabel={t("intro.diagram.landingLabel")}
          caption={t("intro.diagram.caption")}
        />
        <p>{t("intro.paragraph2")}</p>
        <ProjectileRangeVsAngleDiagram
          xLabel={t("intro.rangeVsAngle.xLabel")}
          yLabel={t("intro.rangeVsAngle.yLabel")}
          peakLabel={t("intro.rangeVsAngle.peakLabel")}
          caption={t("intro.rangeVsAngle.caption")}
        />
        <p>{t("intro.paragraph3")}</p>
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
        <div>
          <h3 className="font-semibold">{t("behindTheTool.componentsSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.componentsSection.paragraph")}</p>
          <ProjectileVelocityComponentsDiagram
            angleDegrees={45}
            vxLabel="vₓ = 14.1"
            vyLabel="vy = 14.1"
            vLabel="v₀ = 20"
            caption={t("behindTheTool.componentsSection.caption")}
          />
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.impactSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.impactSection.paragraph")}</p>
          <ProjectileImpactVelocityDiagram impactAngleDegrees={45} speedLabel="v = 20 m/s" angleLabel="45°" caption={t("behindTheTool.impactSection.caption")} />
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.gravityComparisonSection.title")}</h3>
          <p className="mt-2">{t("behindTheTool.gravityComparisonSection.paragraph")}</p>
          <ProjectileGravityComparisonDiagram
            labels={[t("behindTheTool.gravityComparisonSection.earth"), t("behindTheTool.gravityComparisonSection.moon"), t("behindTheTool.gravityComparisonSection.mars")]}
            caption={t("behindTheTool.gravityComparisonSection.caption")}
          />
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
