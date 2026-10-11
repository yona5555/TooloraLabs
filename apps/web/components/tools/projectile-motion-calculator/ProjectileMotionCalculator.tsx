"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ProjectileMotionCalculator as ProjectileMotionCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import ProjectileMotionInputPanel from "./ProjectileMotionInputPanel";
import ProjectileMotionResult from "./ProjectileMotionResult";
import ProjectileMotionQuickReference from "./ProjectileMotionQuickReference";
import ProjectileMotionReferenceTable from "./ProjectileMotionReferenceTable";
import { PmLiveProvider, parseInputs } from "./PmLiveContext";
import { GRAVITY_PRESET_VALUES, PROJECTILE_DEFAULTS, PROJECTILE_SCENARIOS, type GravityPreset, type ProjectileInputs } from "./types";

const tool = new ProjectileMotionCalculatorTool();

const RELATED_TOOLS = ["kinematics-calculator", "force-calculator", "energy-work-power-calculator"];

function presetFor(gravity: string): GravityPreset {
  const g = parseInputs({ ...PROJECTILE_DEFAULTS, gravity }).gravity;
  const hit = (Object.keys(GRAVITY_PRESET_VALUES) as Exclude<GravityPreset, "custom">[]).find((k) => GRAVITY_PRESET_VALUES[k] === g);
  return hit ?? "custom";
}

export default function ProjectileMotionCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.projectile-motion-calculator.nav");
  const t = useTranslations("tools.projectile-motion-calculator");
  const tForm = useTranslations("tools.projectile-motion-calculator.form");
  const tScenarios = useTranslations("tools.projectile-motion-calculator.form.scenarios");
  const tCommon = useTranslations("common.live3d");

  const [inputs, setInputs] = useState<ProjectileInputs>(PROJECTILE_DEFAULTS);
  const [gravityPreset, setGravityPreset] = useState<GravityPreset>("earth");
  const [activeExample, setActiveExample] = useState<string | null>(null);

  function setField(key: keyof ProjectileInputs, value: string) {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setActiveExample(null);
    if (key === "gravity" && gravityPreset !== "custom") setGravityPreset(presetFor(value));
  }

  function handleGravityPresetChange(next: GravityPreset) {
    setGravityPreset(next);
    if (next !== "custom") setInputs((prev) => ({ ...prev, gravity: String(GRAVITY_PRESET_VALUES[next]) }));
    setActiveExample(null);
  }

  function handlePick(key: string) {
    const preset = PROJECTILE_SCENARIOS.find((s) => s.key === key);
    if (!preset) return;
    setInputs({ speed: preset.speed, angle: preset.angle, height: preset.height, gravity: String(GRAVITY_PRESET_VALUES[preset.gravityPreset]) });
    setGravityPreset(preset.gravityPreset);
    setActiveExample(key);
  }

  function handleClear() {
    setInputs(PROJECTILE_DEFAULTS);
    setGravityPreset("earth");
    setActiveExample(null);
  }

  const values = parseInputs(inputs);
  const digitStyle = resolveDigitStyle(inputs.speed, inputs.angle, inputs.height, inputs.gravity);
  const result = useMemo(() => tool.execute(parseInputs(inputs), { locale: "en-US" }).data, [inputs]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <PmLiveProvider value={{ dims: inputs, setDim: (key, value) => setField(key, value as string) }}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <ProjectileMotionInputPanel
                inputs={inputs}
                onFieldChange={setField}
                gravityPreset={gravityPreset}
                onGravityPresetChange={handleGravityPresetChange}
                onClear={handleClear}
              />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={PROJECTILE_SCENARIOS.map((s) => ({
                  id: s.key,
                  label: tScenarios(s.key),
                  detail: `v₀ ${s.speed} m/s · θ ${s.angle}° · h₀ ${s.height} m · g ${GRAVITY_PRESET_VALUES[s.gravityPreset]}`,
                }))}
              />
            </div>
          }
          result={
            <ProjectileMotionResult
              result={result}
              speed={values.speed}
              angle={values.angle}
              height={values.height}
              gravity={values.gravity}
              gravityPresetLabel={tForm(`gravityPreset.${gravityPreset}`)}
              digitStyle={digitStyle}
            />
          }
          sidebar={
            <RelatedToolsSidebar fill currentSlug="projectile-motion-calculator" category="physics" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="projectile-motion-calculator" />
              <ProjectileMotionQuickReference />
              <ProjectileMotionReferenceTable />
            </div>
          }
        />
      </div>

      {education}
    </PmLiveProvider>
  );
}
