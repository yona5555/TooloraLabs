import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import AdSpace from "@/components/tool-ui/AdSpace";
import MatrixTransformDiagram from "./MatrixTransformDiagram";
import MatrixCompositionDiagram from "./MatrixCompositionDiagram";
import MatrixInverseDiagram from "./MatrixInverseDiagram";
import MatrixTransposeDiagram from "./MatrixTransposeDiagram";

type ExampleRow = { calculation: string; result: string };
type ApplicationItem = { title: string; description: string };

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2));

export default async function MatrixEducation() {
  const t = await getTranslations("tools.matrix-calculator.education");

  const exampleRows = t.raw("examples.rows") as ExampleRow[];
  const applicationItems = t.raw("applications.items") as ApplicationItem[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
        <p>{t("intro.paragraph3")}</p>
      </InfoSection>

      <InfoSection title={t("variables.title")}>
        <p>{t("variables.intro")}</p>

        <div>
          <h3 className="font-semibold">{t("variables.determinant.title")}</h3>
          <p className="mt-1">{t("variables.determinant.description")}</p>
          <MatrixTransformDiagram
            a11={2}
            a12={1}
            a21={0}
            a22={2}
            color="text-emerald-500 dark:text-emerald-400"
            label="A"
            areaLabel="det(A) = 4"
            caption={t("variables.determinant.diagramCaption")}
          />
        </div>

        <div>
          <h3 className="font-semibold">{t("variables.composition.title")}</h3>
          <p className="mt-1">{t("variables.composition.description")}</p>
          <MatrixCompositionDiagram
            b11={1}
            b12={0}
            b21={0}
            b22={1.5}
            product11={2}
            product12={1.5}
            product21={0}
            product22={3}
            labelB="B"
            labelProduct="A×B"
            caption={t("variables.composition.diagramCaption")}
          />
        </div>

        <div>
          <h3 className="font-semibold">{t("variables.inverse.title")}</h3>
          <p className="mt-1">{t("variables.inverse.description")}</p>
          <MatrixInverseDiagram
            a11={2}
            a12={1}
            a21={0}
            a22={2}
            inverseA11={0.5}
            inverseA12={-0.25}
            inverseA21={0}
            inverseA22={0.5}
            labelA="A"
            labelInverse="A⁻¹"
            caption={t("variables.inverse.diagramCaption")}
          />
        </div>

        <div>
          <h3 className="font-semibold">{t("variables.transpose.title")}</h3>
          <p className="mt-1">{t("variables.transpose.description")}</p>
          <MatrixTransposeDiagram a11={1} a12={2} a21={3} a22={4} fmt={fmt} caption={t("variables.transpose.diagramCaption")} />
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
                  <td className="px-3 py-2.5 font-mono font-semibold">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <h3 className="font-semibold">{t("behindTheTool.computationalEra.title")}</h3>
          <p className="mt-2">{t("behindTheTool.computationalEra.paragraph")}</p>
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
