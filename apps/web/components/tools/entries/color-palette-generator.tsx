import ColorPaletteEducation from "@/components/tools/color-palette-generator/ColorPaletteEducation";
import ColorPaletteGeneratorTool from "@/components/tools/color-palette-generator/ColorPaletteGenerator";

export default function ToolEntry() {
  return <ColorPaletteGeneratorTool education={<ColorPaletteEducation />} />;
}
