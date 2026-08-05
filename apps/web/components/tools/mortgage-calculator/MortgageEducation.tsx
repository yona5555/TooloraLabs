import { getTranslations } from "next-intl/server";
import EncyclopediaPaper from "@/components/tool-ui/EncyclopediaPaper";
import InfoSection from "@/components/tool-ui/InfoSection";
import FAQAccordion, { type FAQItem } from "@/components/tool-ui/FAQAccordion";
import AcademicPathSection, { type University } from "@/components/tool-ui/AcademicPathSection";
import MortgagePMIThresholdTable from "./MortgagePMIThresholdTable";

type ExampleStep = { label: string; value: string };
type PaymentComponent = { label: string; description: string };
type ThresholdRow = { label: string; threshold: string; note: string };

export default async function MortgageEducation() {
  const t = await getTranslations("tools.mortgage-calculator.education");

  const amortizationSteps = t.raw("amortization.example.steps") as ExampleStep[];
  const paymentComponents = t.raw("paymentComponents.items") as PaymentComponent[];
  const pmiThresholds = t.raw("pmi.thresholds.rows") as ThresholdRow[];
  const extraPaymentSteps = t.raw("extraPayments.example.steps") as ExampleStep[];
  const faqItems = t.raw("faq.items") as FAQItem[];
  const universities = t.raw("behindTheTool.academicPath.universities") as University[];

  return (
    <EncyclopediaPaper>
      <InfoSection title={t("intro.title")}>
        <p>{t("intro.paragraph1")}</p>
        <p>{t("intro.paragraph2")}</p>
        <p className="rounded-sm border border-current/20 px-4 py-3 text-sm">{t("intro.disclaimer")}</p>
      </InfoSection>

      <InfoSection title={t("amortization.title")}>
        <p>{t("amortization.intro")}</p>
        <div className="rounded-sm border border-current/20 p-4">
          <p className="text-sm opacity-70">{t("amortization.formula.label")}</p>
          <p dir="ltr" className="mt-2 text-end font-semibold">
            {t("amortization.formula.formula")}
          </p>
        </div>
        <p className="text-sm opacity-70">{t("amortization.formula.note")}</p>

        <h3 className="pt-2 font-semibold">{t("amortization.example.title")}</h3>
        <p>{t("amortization.example.intro")}</p>
        <ol className="space-y-3">
          {amortizationSteps.map((step, index) => (
            <li
              key={step.label}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-sm border border-current/20 px-4 py-3"
            >
              <span className="font-medium">
                {index + 1}. {step.label}
              </span>
              <span dir="ltr" className="text-sm opacity-80">
                {step.value}
              </span>
            </li>
          ))}
        </ol>
        <p className="font-medium">{t("amortization.example.result")}</p>
      </InfoSection>

      <InfoSection title={t("paymentComponents.title")}>
        <p>{t("paymentComponents.intro")}</p>
        <ul className="space-y-3">
          {paymentComponents.map((item) => (
            <li key={item.label} className="rounded-sm border border-current/20 p-4">
              <p className="font-semibold">{item.label}</p>
              <p className="mt-1 text-sm opacity-80">{item.description}</p>
            </li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection title={t("pmi.title")}>
        <p>{t("pmi.intro")}</p>
        <MortgagePMIThresholdTable rows={pmiThresholds} />
        <p className="text-sm opacity-70">{t("pmi.note")}</p>
      </InfoSection>

      <InfoSection title={t("extraPayments.title")}>
        <p>{t("extraPayments.intro")}</p>
        <h3 className="pt-2 font-semibold">{t("extraPayments.example.title")}</h3>
        <p>{t("extraPayments.example.intro")}</p>
        <ol className="space-y-3">
          {extraPaymentSteps.map((step, index) => (
            <li
              key={step.label}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-sm border border-current/20 px-4 py-3"
            >
              <span className="font-medium">
                {index + 1}. {step.label}
              </span>
              <span dir="ltr" className="text-sm opacity-80">
                {step.value}
              </span>
            </li>
          ))}
        </ol>
        <p className="font-medium">{t("extraPayments.example.result")}</p>
      </InfoSection>

      <InfoSection title={t("rateTypes.title")}>
        <p>{t("rateTypes.intro")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-current/20 p-4">
            <h3 className="font-semibold">{t("rateTypes.fixed.title")}</h3>
            <p className="mt-2 text-sm opacity-80">{t("rateTypes.fixed.paragraph")}</p>
          </div>
          <div className="rounded-sm border border-current/20 p-4">
            <h3 className="font-semibold">{t("rateTypes.adjustable.title")}</h3>
            <p className="mt-2 text-sm opacity-80">{t("rateTypes.adjustable.paragraph")}</p>
          </div>
        </div>
      </InfoSection>

      <InfoSection title={t("limitations.title")}>
        <p>{t("limitations.paragraph1")}</p>
        <p>{t("limitations.paragraph2")}</p>
      </InfoSection>

      <InfoSection title={t("faq.title")}>
        <FAQAccordion items={faqItems} />
      </InfoSection>

      <InfoSection title={t("behindTheTool.title")}>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.history.title")}</h3>
          <p className="mt-2">{t("behindTheTool.history.paragraph")}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t("behindTheTool.equipment.title")}</h3>
          <p className="mt-2">{t("behindTheTool.equipment.paragraph")}</p>
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

      <InfoSection title={t("references.title")}>
        <p>{t("references.citation")}</p>
        <p className="text-sm opacity-70">{t("references.note")}</p>
        <p dir="ltr" className="text-sm opacity-70">
          {t("references.doiLabel")}: {t("references.doi")}
        </p>
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
