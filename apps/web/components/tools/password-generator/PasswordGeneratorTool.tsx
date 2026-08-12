"use client";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { PasswordGenerator, type PasswordGeneratorOutput } from "@tooloralabs/tools";
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

const EMPTY_RESULT: PasswordGeneratorOutput = { password: "", entropyBits: 0, poolSize: 0 };

export default function PasswordGeneratorTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.password-generator.nav");

  const [form, setForm] = useState<PasswordFormState>(INITIAL_FORM);
  const [seed, setSeed] = useState(0);
  // Generating with crypto.getRandomValues() must stay client-only: computing it
  // during render (e.g. via useMemo) would run once on the server and again on
  // the client during hydration, producing two different passwords and a
  // hydration mismatch. Starting from an empty result and filling it in a
  // post-mount effect keeps server and client markup identical at hydration time.
  const [result, setResult] = useState<PasswordGeneratorOutput>(EMPTY_RESULT);

  function patchForm(patch: Partial<PasswordFormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const regenerate = useCallback(() => setSeed((s) => s + 1), []);

  useEffect(() => {
    // Deferred to a microtask so this genuinely runs after the commit (not
    // synchronously inside the effect body), avoiding a cascading render.
    queueMicrotask(() => {
      const output = tool.execute(form, { locale: "en-US" });
      setResult(output.success ? output.data : EMPTY_RESULT);
    });
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
