import CsvJsonConverterUI from "@/components/tools/csv-json-converter/CsvJsonConverterUI";
import CsvJsonEducation from "@/components/tools/csv-json-converter/CsvJsonEducation";

export default function ToolEntry() {
  return <CsvJsonConverterUI education={<CsvJsonEducation />} />;
}
