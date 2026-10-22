import InventoryEducation from "@/components/tools/inventory-valuation-calculator/InventoryEducation";
import InventoryValuationTool from "@/components/tools/inventory-valuation-calculator/InventoryValuationTool";

export default function ToolEntry() {
  return <InventoryValuationTool education={<InventoryEducation />} />;
}
