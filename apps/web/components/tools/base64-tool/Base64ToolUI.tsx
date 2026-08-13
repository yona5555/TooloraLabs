"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Base64Tool, type Base64Mode, type Base64Variant } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import Base64InputPanel from "./Base64InputPanel";
import Base64Result from "./Base64Result";
import Base64FilePanel from "./Base64FilePanel";

const tool = new Base64Tool();

export default function Base64ToolUI({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.base64-tool.errors");
  const tNav = useTranslations("tools.base64-tool.nav");

  const [text, setText] = useState("");
  const [mode, setMode] = useState<Base64Mode>("encode");
  const [variant, setVariant] = useState<Base64Variant>("standard");

  const digitStyle = resolveDigitStyle(text);

  const { output, errorKey } = useMemo(() => {
    if (!text.trim()) return { output: null, errorKey: "" };

    const result = tool.execute({ text, mode, variant }, { locale: "en-US" });
    if (!result.success) return { output: null, errorKey: "invalidBase64" };

    return { output: result.data, errorKey: "" };
  }, [text, mode, variant]);

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
            <Base64InputPanel
              text={text}
              onTextChange={setText}
              mode={mode}
              onModeChange={setMode}
              variant={variant}
              onVariantChange={setVariant}
            />
          }
          result={
            <Base64Result
              result={output?.result ?? ""}
              errorMessage={errorMessage}
              inputBytes={output?.inputBytes ?? 0}
              outputBytes={output?.outputBytes ?? 0}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="base64-tool" category="developer-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <Base64FilePanel />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
