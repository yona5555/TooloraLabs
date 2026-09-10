"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { GpaCalculator as GpaCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import GpaInputPanel from "./GpaInputPanel";
import GpaResult from "./GpaResult";
import GpaReferenceTable from "./GpaReferenceTable";
import { emptyCourse, GRADE_POINTS, type DraftCourse, type GpaOperation, type GpaScenario } from "./types";

const tool = new GpaCalculatorTool();

const DEFAULT_COURSES: DraftCourse[] = [
  { grade: "A", creditHours: "3" },
  { grade: "B", creditHours: "4" },
  { grade: "A-", creditHours: "3" },
];
const DEFAULTS = { currentGpa: "3.0", currentCredits: "60", targetGpa: "3.5", plannedCredits: "30" };

export default function GpaCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.gpa-calculator.nav");

  const [operation, setOperation] = useState<GpaOperation>("calculate");
  const [courses, setCourses] = useState<DraftCourse[]>(DEFAULT_COURSES);
  const [currentGpa, setCurrentGpa] = useState(DEFAULTS.currentGpa);
  const [currentCredits, setCurrentCredits] = useState(DEFAULTS.currentCredits);
  const [targetGpa, setTargetGpa] = useState(DEFAULTS.targetGpa);
  const [plannedCredits, setPlannedCredits] = useState(DEFAULTS.plannedCredits);

  function handleOperationChange(next: GpaOperation) {
    if (next === operation) return;
    setOperation(next);
    if (next === "calculate" && courses.length === 0) {
      setCourses([emptyCourse()]);
    }
  }

  function handleScenarioPreset(scenario: GpaScenario) {
    setCourses(scenario.courses.map((c) => ({ grade: c.grade, creditHours: c.creditHours })));
  }

  function handleClear() {
    setOperation("calculate");
    setCourses(DEFAULT_COURSES);
    setCurrentGpa(DEFAULTS.currentGpa);
    setCurrentCredits(DEFAULTS.currentCredits);
    setTargetGpa(DEFAULTS.targetGpa);
    setPlannedCredits(DEFAULTS.plannedCredits);
  }

  const digitStyle: DigitStyle = resolveDigitStyle(
    currentGpa,
    currentCredits,
    targetGpa,
    plannedCredits,
    ...courses.map((c) => c.creditHours)
  );

  const result = useMemo(() => {
    const parsedCourses = courses.map((c) => ({
      gradePoints: GRADE_POINTS[c.grade],
      creditHours: parseLocalizedNumber(c.creditHours) || 0,
    }));
    const output = tool.execute(
      {
        operation,
        courses: parsedCourses,
        currentGpa: parseLocalizedNumber(currentGpa) || 0,
        currentCredits: parseLocalizedNumber(currentCredits) || 0,
        targetGpa: parseLocalizedNumber(targetGpa) || 0,
        plannedCredits: parseLocalizedNumber(plannedCredits) || 0,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [operation, courses, currentGpa, currentCredits, targetGpa, plannedCredits]);

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
            <div className="flex flex-col gap-3">
              <GpaInputPanel
                operation={operation}
                onOperationChange={handleOperationChange}
                courses={courses}
                onCoursesChange={setCourses}
                onScenarioPreset={handleScenarioPreset}
                currentGpa={currentGpa}
                onCurrentGpaChange={setCurrentGpa}
                currentCredits={currentCredits}
                onCurrentCreditsChange={setCurrentCredits}
                targetGpa={targetGpa}
                onTargetGpaChange={setTargetGpa}
                plannedCredits={plannedCredits}
                onPlannedCreditsChange={setPlannedCredits}
                onClear={handleClear}
              />
              <GpaReferenceTable />
            </div>
          }
          result={
            <GpaResult
              result={result}
              operation={operation}
              digitStyle={digitStyle}
              courseCount={courses.length}
              targetGpaInput={targetGpa}
              plannedCreditsInput={plannedCredits}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="gpa-calculator" category="student-productivity" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="gpa-calculator" />
              <SectionNav items={navItems} />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
