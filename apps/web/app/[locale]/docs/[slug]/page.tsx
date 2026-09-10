import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getOgLocale } from "@/lib/locale-meta";
import { DOCUMENTED_TOOL_SLUGS } from "@/lib/docs-tools";
import DocsLayout from "@/components/docs/DocsLayout";
import TableOfContents, { type TocItem } from "@/components/docs/TableOfContents";
import CompoundInterestDocsPage, { getCompoundInterestTocItems } from "@/components/docs/compound-interest-calculator/CompoundInterestDocsPage";
import LoanCalculatorDocsPage, { getLoanCalculatorTocItems } from "@/components/docs/loan-calculator/LoanCalculatorDocsPage";
import AffordableLoanCalculatorDocsPage, { getAffordableLoanCalculatorTocItems } from "@/components/docs/affordable-loan-calculator/AffordableLoanCalculatorDocsPage";
import RetirementCalculatorDocsPage, { getRetirementCalculatorTocItems } from "@/components/docs/retirement-calculator/RetirementCalculatorDocsPage";
import HouseAffordabilityCalculatorDocsPage, { getHouseAffordabilityCalculatorTocItems } from "@/components/docs/house-affordability-calculator/HouseAffordabilityCalculatorDocsPage";
import DebtToIncomeCalculatorDocsPage, { getDebtToIncomeCalculatorTocItems } from "@/components/docs/debt-to-income-calculator/DebtToIncomeCalculatorDocsPage";
import MortgageCalculatorDocsPage, { getMortgageCalculatorTocItems } from "@/components/docs/mortgage-calculator/MortgageCalculatorDocsPage";
import PercentageCalculatorDocsPage, { getPercentageCalculatorTocItems } from "@/components/docs/percentage-calculator/PercentageCalculatorDocsPage";
import GcfLcmCalculatorDocsPage, { getGcfLcmCalculatorTocItems } from "@/components/docs/gcf-lcm-calculator/GcfLcmCalculatorDocsPage";
import FractionCalculatorDocsPage, { getFractionCalculatorTocItems } from "@/components/docs/fraction-calculator/FractionCalculatorDocsPage";
import ScientificNotationConverterDocsPage, { getScientificNotationConverterTocItems } from "@/components/docs/scientific-notation-converter/ScientificNotationConverterDocsPage";
import SignificantFiguresCalculatorDocsPage, { getSignificantFiguresCalculatorTocItems } from "@/components/docs/significant-figures-calculator/SignificantFiguresCalculatorDocsPage";
import AreaCalculatorDocsPage, { getAreaCalculatorTocItems } from "@/components/docs/area-calculator/AreaCalculatorDocsPage";
import SurfaceAreaCalculatorDocsPage, { getSurfaceAreaCalculatorTocItems } from "@/components/docs/surface-area-calculator/SurfaceAreaCalculatorDocsPage";
import VolumeCalculatorDocsPage, { getVolumeCalculatorTocItems } from "@/components/docs/volume-calculator/VolumeCalculatorDocsPage";
import CircleCalculatorDocsPage, { getCircleCalculatorTocItems } from "@/components/docs/circle-calculator/CircleCalculatorDocsPage";
import TriangleCalculatorDocsPage, { getTriangleCalculatorTocItems } from "@/components/docs/triangle-calculator/TriangleCalculatorDocsPage";
import StatisticsCalculatorDocsPage, { getStatisticsCalculatorTocItems } from "@/components/docs/statistics-calculator/StatisticsCalculatorDocsPage";
import MeanMedianModeRangeCalculatorDocsPage, { getMeanMedianModeRangeCalculatorTocItems } from "@/components/docs/mean-median-mode-range-calculator/MeanMedianModeRangeCalculatorDocsPage";
import StandardDeviationCalculatorDocsPage, { getStandardDeviationCalculatorTocItems } from "@/components/docs/standard-deviation-calculator/StandardDeviationCalculatorDocsPage";
import ProbabilityCalculatorDocsPage, { getProbabilityCalculatorTocItems } from "@/components/docs/probability-calculator/ProbabilityCalculatorDocsPage";
import RandomNumberGeneratorDocsPage, { getRandomNumberGeneratorTocItems } from "@/components/docs/random-number-generator/RandomNumberGeneratorDocsPage";
import ScientificCalculatorDocsPage, { getScientificCalculatorTocItems } from "@/components/docs/scientific-calculator/ScientificCalculatorDocsPage";
import StepByStepMathSolverDocsPage, { getStepByStepMathSolverTocItems } from "@/components/docs/step-by-step-math-solver/StepByStepMathSolverDocsPage";
import MatrixCalculatorDocsPage, { getMatrixCalculatorTocItems } from "@/components/docs/matrix-calculator/MatrixCalculatorDocsPage";
import VectorCalculatorDocsPage, { getVectorCalculatorTocItems } from "@/components/docs/vector-calculator/VectorCalculatorDocsPage";
import GraphingCalculatorDocsPage, { getGraphingCalculatorTocItems } from "@/components/docs/graphing-calculator/GraphingCalculatorDocsPage";
import NotepadCalculatorDocsPage, { getNotepadCalculatorTocItems } from "@/components/docs/notepad-calculator/NotepadCalculatorDocsPage";
import MultiplicationTableGeneratorDocsPage, { getMultiplicationTableGeneratorTocItems } from "@/components/docs/multiplication-table-generator/MultiplicationTableGeneratorDocsPage";
import TipCalculatorDocsPage, { getTipCalculatorTocItems } from "@/components/docs/tip-calculator/TipCalculatorDocsPage";
import DiscountCalculatorDocsPage, { getDiscountCalculatorTocItems } from "@/components/docs/discount-calculator/DiscountCalculatorDocsPage";
import SalesTaxCalculatorDocsPage, { getSalesTaxCalculatorTocItems } from "@/components/docs/sales-tax-calculator/SalesTaxCalculatorDocsPage";
import InvoiceGeneratorDocsPage, { getInvoiceGeneratorTocItems } from "@/components/docs/invoice-generator/InvoiceGeneratorDocsPage";
import InventoryValuationCalculatorDocsPage, { getInventoryValuationCalculatorTocItems } from "@/components/docs/inventory-valuation-calculator/InventoryValuationCalculatorDocsPage";
import BreakEvenCalculatorDocsPage, { getBreakEvenCalculatorTocItems } from "@/components/docs/break-even-calculator/BreakEvenCalculatorDocsPage";
import FuelCostCalculatorDocsPage, { getFuelCostCalculatorTocItems } from "@/components/docs/fuel-cost-calculator/FuelCostCalculatorDocsPage";
import BatchInvoiceCalculatorDocsPage, { getBatchInvoiceCalculatorTocItems } from "@/components/docs/batch-invoice-calculator/BatchInvoiceCalculatorDocsPage";
import TDEECalculatorDocsPage, { getTDEECalculatorTocItems } from "@/components/docs/tdee-calculator/TDEECalculatorDocsPage";
import BMICalculatorDocsPage, { getBMICalculatorTocItems } from "@/components/docs/bmi-calculator/BMICalculatorDocsPage";
import IdealWeightCalculatorDocsPage, { getIdealWeightCalculatorTocItems } from "@/components/docs/ideal-weight-calculator/IdealWeightCalculatorDocsPage";
import TargetHeartRateCalculatorDocsPage, { getTargetHeartRateCalculatorTocItems } from "@/components/docs/target-heart-rate-calculator/TargetHeartRateCalculatorDocsPage";
import SleepCalculatorDocsPage, { getSleepCalculatorTocItems } from "@/components/docs/sleep-calculator/SleepCalculatorDocsPage";
import BodyFatCalculatorDocsPage, { getBodyFatCalculatorTocItems } from "@/components/docs/body-fat-calculator/BodyFatCalculatorDocsPage";
import DueDateCalculatorDocsPage, { getDueDateCalculatorTocItems } from "@/components/docs/due-date-calculator/DueDateCalculatorDocsPage";
import OvulationCalculatorDocsPage, { getOvulationCalculatorTocItems } from "@/components/docs/ovulation-calculator/OvulationCalculatorDocsPage";
import PregnancyCalculatorDocsPage, { getPregnancyCalculatorTocItems } from "@/components/docs/pregnancy-calculator/PregnancyCalculatorDocsPage";
import MacroCalculatorDocsPage, { getMacroCalculatorTocItems } from "@/components/docs/macro-calculator/MacroCalculatorDocsPage";
import BMRCalculatorDocsPage, { getBMRCalculatorTocItems } from "@/components/docs/bmr-calculator/BMRCalculatorDocsPage";
import PaceCalculatorDocsPage, { getPaceCalculatorTocItems } from "@/components/docs/pace-calculator/PaceCalculatorDocsPage";
import DensityCalculatorDocsPage, { getDensityCalculatorTocItems } from "@/components/docs/density-calculator/DensityCalculatorDocsPage";
import OhmsLawCalculatorDocsPage, { getOhmsLawCalculatorTocItems } from "@/components/docs/ohms-law-calculator/OhmsLawCalculatorDocsPage";
import EnergyWorkPowerCalculatorDocsPage, { getEnergyWorkPowerCalculatorTocItems } from "@/components/docs/energy-work-power-calculator/EnergyWorkPowerCalculatorDocsPage";
import KinematicsCalculatorDocsPage, { getKinematicsCalculatorTocItems } from "@/components/docs/kinematics-calculator/KinematicsCalculatorDocsPage";
import ForceCalculatorDocsPage, { getForceCalculatorTocItems } from "@/components/docs/force-calculator/ForceCalculatorDocsPage";
import ProjectileMotionCalculatorDocsPage, { getProjectileMotionCalculatorTocItems } from "@/components/docs/projectile-motion-calculator/ProjectileMotionCalculatorDocsPage";
import PhCalculatorDocsPage, { getPhCalculatorTocItems } from "@/components/docs/ph-calculator/PhCalculatorDocsPage";
import MolarityCalculatorDocsPage, { getMolarityCalculatorTocItems } from "@/components/docs/molarity-calculator/MolarityCalculatorDocsPage";
import IdealGasLawCalculatorDocsPage, { getIdealGasLawCalculatorTocItems } from "@/components/docs/ideal-gas-law-calculator/IdealGasLawCalculatorDocsPage";
import ChemicalEquationBalancerDocsPage, { getChemicalEquationBalancerTocItems } from "@/components/docs/chemical-equation-balancer/ChemicalEquationBalancerDocsPage";
import StoichiometryCalculatorDocsPage, { getStoichiometryCalculatorTocItems } from "@/components/docs/stoichiometry-calculator/StoichiometryCalculatorDocsPage";
import MolarMassCalculatorDocsPage, { getMolarMassCalculatorTocItems } from "@/components/docs/molar-mass-calculator/MolarMassCalculatorDocsPage";
import JsonFormatterDocsPage, { getJsonFormatterTocItems } from "@/components/docs/json-formatter/JsonFormatterDocsPage";
import Base64ToolDocsPage, { getBase64ToolTocItems } from "@/components/docs/base64-tool/Base64ToolDocsPage";
import PasswordGeneratorDocsPage, { getPasswordGeneratorTocItems } from "@/components/docs/password-generator/PasswordGeneratorDocsPage";
import BarcodeGeneratorDocsPage, { getBarcodeGeneratorTocItems } from "@/components/docs/barcode-generator/BarcodeGeneratorDocsPage";
import ColorPaletteGeneratorDocsPage, { getColorPaletteGeneratorTocItems } from "@/components/docs/color-palette-generator/ColorPaletteGeneratorDocsPage";
import QrCodeGeneratorDocsPage, { getQrCodeGeneratorTocItems } from "@/components/docs/qr-code-generator/QrCodeGeneratorDocsPage";
import PdfMergeSplitDocsPage, { getPdfMergeSplitTocItems } from "@/components/docs/pdf-merge-split/PdfMergeSplitDocsPage";
import ZipCompressorDocsPage, { getZipCompressorTocItems } from "@/components/docs/zip-compressor/ZipCompressorDocsPage";
import CsvJsonConverterDocsPage, { getCsvJsonConverterTocItems } from "@/components/docs/csv-json-converter/CsvJsonConverterDocsPage";
import FileSizeConverterDocsPage, { getFileSizeConverterTocItems } from "@/components/docs/file-size-converter/FileSizeConverterDocsPage";
import FileNameSanitizerDocsPage, { getFileNameSanitizerTocItems } from "@/components/docs/file-name-sanitizer/FileNameSanitizerDocsPage";
import DuplicateLineRemoverDocsPage, { getDuplicateLineRemoverTocItems } from "@/components/docs/duplicate-line-remover/DuplicateLineRemoverDocsPage";

type DocsPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return DOCUMENTED_TOOL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!DOCUMENTED_TOOL_SLUGS.includes(slug)) {
    const t = await getTranslations({ locale, namespace: "toolPage" });
    return { title: `${t("notFoundTitle")} | TooloraLabs` };
  }

  const t = await getTranslations({ locale, namespace: "tools" });
  const pageTitle = `${t(`${slug}.title`)} Docs | TooloraLabs`;
  const description = t(`${slug}.description`);
  const path = `/docs/${slug}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: Object.fromEntries(routing.locales.map((loc) => [loc, `/${loc}${path}`])),
    },
    openGraph: {
      title: pageTitle,
      description,
      url: `/${locale}${path}`,
      siteName: "TooloraLabs",
      locale: getOgLocale(locale),
      alternateLocale: routing.locales.filter((loc) => loc !== locale).map(getOgLocale),
      type: "website",
    },
  };
}

export default async function DocsToolPage({ params }: DocsPageProps) {
  const { slug } = await params;
  if (!DOCUMENTED_TOOL_SLUGS.includes(slug)) {
    notFound();
  }

  let content = null;
  let tocItems: TocItem[] = [];

  switch (slug) {
    case "compound-interest-calculator":
      content = <CompoundInterestDocsPage />;
      tocItems = await getCompoundInterestTocItems();
      break;
    case "loan-calculator":
      content = <LoanCalculatorDocsPage />;
      tocItems = await getLoanCalculatorTocItems();
      break;
    case "affordable-loan-calculator":
      content = <AffordableLoanCalculatorDocsPage />;
      tocItems = await getAffordableLoanCalculatorTocItems();
      break;
    case "retirement-calculator":
      content = <RetirementCalculatorDocsPage />;
      tocItems = await getRetirementCalculatorTocItems();
      break;
    case "house-affordability-calculator":
      content = <HouseAffordabilityCalculatorDocsPage />;
      tocItems = await getHouseAffordabilityCalculatorTocItems();
      break;
    case "debt-to-income-calculator":
      content = <DebtToIncomeCalculatorDocsPage />;
      tocItems = await getDebtToIncomeCalculatorTocItems();
      break;
    case "mortgage-calculator":
      content = <MortgageCalculatorDocsPage />;
      tocItems = await getMortgageCalculatorTocItems();
      break;
    case "percentage-calculator":
      content = <PercentageCalculatorDocsPage />;
      tocItems = await getPercentageCalculatorTocItems();
      break;
    case "gcf-lcm-calculator":
      content = <GcfLcmCalculatorDocsPage />;
      tocItems = await getGcfLcmCalculatorTocItems();
      break;
    case "fraction-calculator":
      content = <FractionCalculatorDocsPage />;
      tocItems = await getFractionCalculatorTocItems();
      break;
    case "scientific-notation-converter":
      content = <ScientificNotationConverterDocsPage />;
      tocItems = await getScientificNotationConverterTocItems();
      break;
    case "significant-figures-calculator":
      content = <SignificantFiguresCalculatorDocsPage />;
      tocItems = await getSignificantFiguresCalculatorTocItems();
      break;
    case "area-calculator":
      content = <AreaCalculatorDocsPage />;
      tocItems = await getAreaCalculatorTocItems();
      break;
    case "surface-area-calculator":
      content = <SurfaceAreaCalculatorDocsPage />;
      tocItems = await getSurfaceAreaCalculatorTocItems();
      break;
    case "volume-calculator":
      content = <VolumeCalculatorDocsPage />;
      tocItems = await getVolumeCalculatorTocItems();
      break;
    case "circle-calculator":
      content = <CircleCalculatorDocsPage />;
      tocItems = await getCircleCalculatorTocItems();
      break;
    case "triangle-calculator":
      content = <TriangleCalculatorDocsPage />;
      tocItems = await getTriangleCalculatorTocItems();
      break;
    case "statistics-calculator":
      content = <StatisticsCalculatorDocsPage />;
      tocItems = await getStatisticsCalculatorTocItems();
      break;
    case "mean-median-mode-range-calculator":
      content = <MeanMedianModeRangeCalculatorDocsPage />;
      tocItems = await getMeanMedianModeRangeCalculatorTocItems();
      break;
    case "standard-deviation-calculator":
      content = <StandardDeviationCalculatorDocsPage />;
      tocItems = await getStandardDeviationCalculatorTocItems();
      break;
    case "probability-calculator":
      content = <ProbabilityCalculatorDocsPage />;
      tocItems = await getProbabilityCalculatorTocItems();
      break;
    case "random-number-generator":
      content = <RandomNumberGeneratorDocsPage />;
      tocItems = await getRandomNumberGeneratorTocItems();
      break;
    case "scientific-calculator":
      content = <ScientificCalculatorDocsPage />;
      tocItems = await getScientificCalculatorTocItems();
      break;
    case "step-by-step-math-solver":
      content = <StepByStepMathSolverDocsPage />;
      tocItems = await getStepByStepMathSolverTocItems();
      break;
    case "matrix-calculator":
      content = <MatrixCalculatorDocsPage />;
      tocItems = await getMatrixCalculatorTocItems();
      break;
    case "vector-calculator":
      content = <VectorCalculatorDocsPage />;
      tocItems = await getVectorCalculatorTocItems();
      break;
    case "graphing-calculator":
      content = <GraphingCalculatorDocsPage />;
      tocItems = await getGraphingCalculatorTocItems();
      break;
    case "notepad-calculator":
      content = <NotepadCalculatorDocsPage />;
      tocItems = await getNotepadCalculatorTocItems();
      break;
    case "multiplication-table-generator":
      content = <MultiplicationTableGeneratorDocsPage />;
      tocItems = await getMultiplicationTableGeneratorTocItems();
      break;
    case "tip-calculator":
      content = <TipCalculatorDocsPage />;
      tocItems = await getTipCalculatorTocItems();
      break;
    case "discount-calculator":
      content = <DiscountCalculatorDocsPage />;
      tocItems = await getDiscountCalculatorTocItems();
      break;
    case "sales-tax-calculator":
      content = <SalesTaxCalculatorDocsPage />;
      tocItems = await getSalesTaxCalculatorTocItems();
      break;
    case "invoice-generator":
      content = <InvoiceGeneratorDocsPage />;
      tocItems = await getInvoiceGeneratorTocItems();
      break;
    case "inventory-valuation-calculator":
      content = <InventoryValuationCalculatorDocsPage />;
      tocItems = await getInventoryValuationCalculatorTocItems();
      break;
    case "break-even-calculator":
      content = <BreakEvenCalculatorDocsPage />;
      tocItems = await getBreakEvenCalculatorTocItems();
      break;
    case "fuel-cost-calculator":
      content = <FuelCostCalculatorDocsPage />;
      tocItems = await getFuelCostCalculatorTocItems();
      break;
    case "batch-invoice-calculator":
      content = <BatchInvoiceCalculatorDocsPage />;
      tocItems = await getBatchInvoiceCalculatorTocItems();
      break;
    case "tdee-calculator":
      content = <TDEECalculatorDocsPage />;
      tocItems = await getTDEECalculatorTocItems();
      break;
    case "bmi-calculator":
      content = <BMICalculatorDocsPage />;
      tocItems = await getBMICalculatorTocItems();
      break;
    case "ideal-weight-calculator":
      content = <IdealWeightCalculatorDocsPage />;
      tocItems = await getIdealWeightCalculatorTocItems();
      break;
    case "target-heart-rate-calculator":
      content = <TargetHeartRateCalculatorDocsPage />;
      tocItems = await getTargetHeartRateCalculatorTocItems();
      break;
    case "sleep-calculator":
      content = <SleepCalculatorDocsPage />;
      tocItems = await getSleepCalculatorTocItems();
      break;
    case "body-fat-calculator":
      content = <BodyFatCalculatorDocsPage />;
      tocItems = await getBodyFatCalculatorTocItems();
      break;
    case "due-date-calculator":
      content = <DueDateCalculatorDocsPage />;
      tocItems = await getDueDateCalculatorTocItems();
      break;
    case "ovulation-calculator":
      content = <OvulationCalculatorDocsPage />;
      tocItems = await getOvulationCalculatorTocItems();
      break;
    case "pregnancy-calculator":
      content = <PregnancyCalculatorDocsPage />;
      tocItems = await getPregnancyCalculatorTocItems();
      break;
    case "macro-calculator":
      content = <MacroCalculatorDocsPage />;
      tocItems = await getMacroCalculatorTocItems();
      break;
    case "bmr-calculator":
      content = <BMRCalculatorDocsPage />;
      tocItems = await getBMRCalculatorTocItems();
      break;
    case "pace-calculator":
      content = <PaceCalculatorDocsPage />;
      tocItems = await getPaceCalculatorTocItems();
      break;
    case "density-calculator":
      content = <DensityCalculatorDocsPage />;
      tocItems = await getDensityCalculatorTocItems();
      break;
    case "ohms-law-calculator":
      content = <OhmsLawCalculatorDocsPage />;
      tocItems = await getOhmsLawCalculatorTocItems();
      break;
    case "energy-work-power-calculator":
      content = <EnergyWorkPowerCalculatorDocsPage />;
      tocItems = await getEnergyWorkPowerCalculatorTocItems();
      break;
    case "kinematics-calculator":
      content = <KinematicsCalculatorDocsPage />;
      tocItems = await getKinematicsCalculatorTocItems();
      break;
    case "force-calculator":
      content = <ForceCalculatorDocsPage />;
      tocItems = await getForceCalculatorTocItems();
      break;
    case "projectile-motion-calculator":
      content = <ProjectileMotionCalculatorDocsPage />;
      tocItems = await getProjectileMotionCalculatorTocItems();
      break;
    case "ph-calculator":
      content = <PhCalculatorDocsPage />;
      tocItems = await getPhCalculatorTocItems();
      break;
    case "molarity-calculator":
      content = <MolarityCalculatorDocsPage />;
      tocItems = await getMolarityCalculatorTocItems();
      break;
    case "ideal-gas-law-calculator":
      content = <IdealGasLawCalculatorDocsPage />;
      tocItems = await getIdealGasLawCalculatorTocItems();
      break;
    case "chemical-equation-balancer":
      content = <ChemicalEquationBalancerDocsPage />;
      tocItems = await getChemicalEquationBalancerTocItems();
      break;
    case "stoichiometry-calculator":
      content = <StoichiometryCalculatorDocsPage />;
      tocItems = await getStoichiometryCalculatorTocItems();
      break;
    case "molar-mass-calculator":
      content = <MolarMassCalculatorDocsPage />;
      tocItems = await getMolarMassCalculatorTocItems();
      break;
    case "json-formatter":
      content = <JsonFormatterDocsPage />;
      tocItems = await getJsonFormatterTocItems();
      break;
    case "base64-tool":
      content = <Base64ToolDocsPage />;
      tocItems = await getBase64ToolTocItems();
      break;
    case "password-generator":
      content = <PasswordGeneratorDocsPage />;
      tocItems = await getPasswordGeneratorTocItems();
      break;
    case "barcode-generator":
      content = <BarcodeGeneratorDocsPage />;
      tocItems = await getBarcodeGeneratorTocItems();
      break;
    case "color-palette-generator":
      content = <ColorPaletteGeneratorDocsPage />;
      tocItems = await getColorPaletteGeneratorTocItems();
      break;
    case "qr-code-generator":
      content = <QrCodeGeneratorDocsPage />;
      tocItems = await getQrCodeGeneratorTocItems();
      break;
    case "pdf-merge-split":
      content = <PdfMergeSplitDocsPage />;
      tocItems = await getPdfMergeSplitTocItems();
      break;
    case "zip-compressor":
      content = <ZipCompressorDocsPage />;
      tocItems = await getZipCompressorTocItems();
      break;
    case "csv-json-converter":
      content = <CsvJsonConverterDocsPage />;
      tocItems = await getCsvJsonConverterTocItems();
      break;
    case "file-size-converter":
      content = <FileSizeConverterDocsPage />;
      tocItems = await getFileSizeConverterTocItems();
      break;
    case "file-name-sanitizer":
      content = <FileNameSanitizerDocsPage />;
      tocItems = await getFileNameSanitizerTocItems();
      break;
    case "duplicate-line-remover":
      content = <DuplicateLineRemoverDocsPage />;
      tocItems = await getDuplicateLineRemoverTocItems();
      break;
  }

  return <DocsLayout toc={<TableOfContents items={tocItems} />}>{content}</DocsLayout>;
}
