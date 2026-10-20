import DiscountCalculator from "@/components/tools/discount-calculator/DiscountCalculator";
import DiscountEducation from "@/components/tools/discount-calculator/DiscountEducation";

export default function ToolEntry() {
  return <DiscountCalculator education={<DiscountEducation />} />;
}
