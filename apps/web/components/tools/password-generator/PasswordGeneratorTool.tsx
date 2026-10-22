"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { analyzePasswordSettings, PasswordGenerator } from "@tooloralabs/tools";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import PasswordInputPanel, { type PasswordFormState } from "./PasswordInputPanel";
import PasswordResult from "./PasswordResult";
import PasswordGuidanceReference from "./PasswordGuidanceReference";
import { INITIAL_FORM, PASSWORD_EXAMPLES, PasswordLiveProvider, type PasswordDraft } from "./PasswordLiveContext";

const tool = new PasswordGenerator();
/** Extra passwords offered in the result card, drawn with the same settings. */
const ALTERNATIVES = 8;

export default function PasswordGeneratorTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.password-generator.nav");
  const tEx = useTranslations("tools.password-generator.examples");
  const [draft, setDraft] = useState<PasswordDraft>({ ...INITIAL_FORM, password: "", alternatives: [] });
  const [seed, setSeed] = useState(0);
  const [activeExample, setActiveExample] = useState<string | null>("standard");
  const [sentinelRef, navBarVisible] = useNavBarVisible();
  const form: PasswordFormState = Object.fromEntries(Object.entries(draft).filter(([k]) => k !== "password" && k !== "alternatives")) as PasswordFormState;
  const formKey = JSON.stringify(form);

  function patchForm(patch: Partial<PasswordFormState>) {
    setDraft((d) => ({ ...d, ...patch }));
    setActiveExample(null);
  }

  function setDim<K extends keyof PasswordDraft>(key: K, value: PasswordDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (key !== "password" && key !== "alternatives") setActiveExample(null);
  }

  // crypto.getRandomValues() must stay client-only: generating during render would run once on the
  // server and again during hydration, giving two different passwords and a hydration mismatch.
  // Every settings-based indicator renders on the server; only the password itself fills in here.
  useEffect(() => {
    queueMicrotask(() => {
      const settings = JSON.parse(formKey) as PasswordFormState;
      const make = () => {
        const output = tool.execute(settings, { locale: "en-US" });
        return output.success ? output.data.password : "";
      };
      setDraft((d) => ({ ...d, password: make(), alternatives: Array.from({ length: ALTERNATIVES }, make).filter(Boolean) }));
    });
  }, [formKey, seed]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <PasswordLiveProvider value={{ dims: draft, setDim }}>
      <div ref={sentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <PasswordInputPanel
                form={form}
                onChange={patchForm}
                onClear={() => {
                  setDraft((d) => ({ ...d, ...INITIAL_FORM }));
                  setActiveExample("standard");
                }}
              />
              <QuickExamplesCard
                title={tEx("title")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={(id) => {
                  const ex = PASSWORD_EXAMPLES.find((e) => e.id === id);
                  if (!ex) return;
                  setDraft((d) => ({ ...d, ...INITIAL_FORM, ...ex.patch }));
                  setActiveExample(id);
                }}
                examples={PASSWORD_EXAMPLES.map((ex) => {
                  const bits = analyzePasswordSettings({ ...INITIAL_FORM, ...ex.patch }).entropyBits;
                  return { id: ex.id, label: tEx(ex.id), detail: tEx("detail", { bits: bits.toLocaleString("en-US", { maximumFractionDigits: 1 }) }) };
                })}
              />
            </div>
          }
          result={<PasswordResult onRegenerate={() => setSeed((s) => s + 1)} />}
          sidebar={<RelatedToolsSidebar fill currentSlug="password-generator" category="developer-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="password-generator" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <PasswordGuidanceReference />
            </div>
          }
        />
      </div>

      {education}
    </PasswordLiveProvider>
  );
}
