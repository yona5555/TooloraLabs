"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { FileNameSanitizer, type FileNameSanitizerInput } from "@tooloralabs/tools";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import FileNameInputPanel from "./FileNameInputPanel";
import FileNameResult from "./FileNameResult";
import PlatformRulesReference from "./PlatformRulesReference";

type Separator = NonNullable<FileNameSanitizerInput["separator"]>;

const tool = new FileNameSanitizer();

export default function FileNameSanitizerTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.file-name-sanitizer.errors");
  const tNav = useTranslations("tools.file-name-sanitizer.nav");

  const [fileName, setFileName] = useState("");
  const [separator, setSeparator] = useState<Separator>("-");
  const [lowercase, setLowercase] = useState(true);
  const [transliterate, setTransliterate] = useState(false);

  const { result, changes, errorKey } = useMemo(() => {
    if (!fileName.trim()) return { result: "", changes: [], errorKey: "" };

    const output = tool.execute({ fileName, separator, lowercase, transliterate }, { locale: "en-US" });
    if (!output.success) {
      const key = output.metadata.error === "EMPTY_INPUT" ? "required" : "invalidResult";
      return { result: "", changes: [], errorKey: key };
    }

    return { result: output.data.result, changes: output.data.changes, errorKey: "" };
  }, [fileName, separator, lowercase, transliterate]);

  const errorMessage = errorKey ? t(errorKey) : "";

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <FileNameInputPanel
              fileName={fileName}
              onFileNameChange={setFileName}
              separator={separator}
              onSeparatorChange={setSeparator}
              lowercase={lowercase}
              onLowercaseChange={setLowercase}
              transliterate={transliterate}
              onTransliterateChange={setTransliterate}
            />
          }
          result={<FileNameResult result={result} errorMessage={errorMessage} changes={changes} />}
          sidebar={<RelatedToolsSidebar currentSlug="file-name-sanitizer" category="file-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <PlatformRulesReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
