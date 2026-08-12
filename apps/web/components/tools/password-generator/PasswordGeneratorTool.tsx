"use client";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { PasswordGenerator } from "@tooloralabs/tools";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import PasswordInputPanel, { type PasswordFormState } from "./PasswordInputPanel";
import PasswordResult from "./PasswordResult";
import PasswordGuidanceReference from "./PasswordGuidanceReference";

const tool = new PasswordGenerator();

const INITIAL_FORM: PasswordFormState = {
  mode: "characters",
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: false,
  excludeAmbiguous: false,
  wordCount: 4,
  separator: "-",
  capitalizeWords: true,
  appendNumber: false,
};

export default function PasswordGeneratorTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.password-generator.nav");

  const [form, setForm] = useState<PasswordFormState>(INITIAL_FORM);
  const [seed, setSeed] = useState(0);

  function patchForm(patch: Partial<PasswordFormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const regenerate = useCallback(() => setSeed((s) => s + 1), []);

  const result = useMemo(() => {
    const output = tool.execute(form, { locale: "en-US" });
    return output.success ? output.data : { password: "", entropyBits: 0, poolSize: 0 };
    // `seed` deliberately forces a fresh random password on "Generate a new one" without changing `form`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, seed]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<PasswordInputPanel form={form} onChange={patchForm} />}
          result={<PasswordResult password={result.password} entropyBits={result.entropyBits} onRegenerate={regenerate} />}
          sidebar={<RelatedToolsSidebar currentSlug="password-generator" category="developer-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <PasswordGuidanceReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
