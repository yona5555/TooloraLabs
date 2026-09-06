"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type Props = {
  eventName: string;
  onEventNameChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  time: string;
  onTimeChange: (value: string) => void;
};

export default function CountdownInputPanel({
  eventName,
  onEventNameChange,
  date,
  onDateChange,
  time,
  onTimeChange,
}: Props) {
  const t = useTranslations("tools.countdown-to-event-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-4">
        <ToolInput
          label={t("eventNameLabel")}
          type="text"
          placeholder={t("eventNamePlaceholder")}
          value={eventName}
          onChange={(e) => onEventNameChange(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <ToolInput label={t("dateLabel")} type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
          <ToolInput label={t("timeLabel")} type="time" value={time} onChange={(e) => onTimeChange(e.target.value)} />
        </div>
      </div>
    </SectionCard>
  );
}
