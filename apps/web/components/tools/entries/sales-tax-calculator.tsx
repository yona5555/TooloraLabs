import SalesTaxCalculator from "@/components/tools/sales-tax-calculator/SalesTaxCalculator";
import SalesTaxEducation from "@/components/tools/sales-tax-calculator/SalesTaxEducation";

export default function ToolEntry() {
  return <SalesTaxCalculator education={<SalesTaxEducation />} />;
}
