"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ClassScheduleBuilder as ClassScheduleBuilderTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ScheduleInputPanel from "./ScheduleInputPanel";
import ScheduleResult from "./ScheduleResult";
import ScheduleQuickReference from "./ScheduleQuickReference";
import type { DraftClass, DayCode } from "./types";

const tool = new ClassScheduleBuilderTool();

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((part) => parseInt(part, 10) || 0);
  return h * 60 + m;
}

export default function ClassScheduleBuilder({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.class-schedule-builder.nav");

  const [classes, setClasses] = useState<DraftClass[]>([
    { name: "Math 101", days: ["mon", "wed"], startTime: "09:00", endTime: "10:30" },
    { name: "Physics 201", days: ["mon"], startTime: "10:00", endTime: "11:00" },
  ]);

  const digitStyle = resolveDigitStyle();

  const result = useMemo(() => {
    const output = tool.execute(
      {
        classes: classes.map((cls) => ({
          name: cls.name || "",
          days: cls.days as DayCode[],
          startMinutes: timeToMinutes(cls.startTime),
          endMinutes: timeToMinutes(cls.endTime),
        })),
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [classes]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<ScheduleInputPanel classes={classes} onClassesChange={setClasses} />}
          result={<ScheduleResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="class-schedule-builder" category="calculators" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ScheduleQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}

