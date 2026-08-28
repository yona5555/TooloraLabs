"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type VectorInputPanelProps = {
  ax: string;
  onAxChange: (value: string) => void;
  ay: string;
  onAyChange: (value: string) => void;
  az: string;
  onAzChange: (value: string) => void;
  bx: string;
  onBxChange: (value: string) => void;
  by: string;
  onByChange: (value: string) => void;
  bz: string;
  onBzChange: (value: string) => void;
};

export default function VectorInputPanel({
  ax,
  onAxChange,
  ay,
  onAyChange,
  az,
  onAzChange,
  bx,
  onBxChange,
  by,
  onByChange,
  bz,
  onBzChange,
}: VectorInputPanelProps) {
  const t = useTranslations("tools.vector-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("vectorALabel")}</p>
          <div className="grid grid-cols-3 gap-3">
            <ToolInput label="x" type="text" inputMode="decimal" value={ax} onChange={(e) => onAxChange(e.target.value)} />
            <ToolInput label="y" type="text" inputMode="decimal" value={ay} onChange={(e) => onAyChange(e.target.value)} />
            <ToolInput label="z" type="text" inputMode="decimal" value={az} onChange={(e) => onAzChange(e.target.value)} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("vectorBLabel")}</p>
          <div className="grid grid-cols-3 gap-3">
            <ToolInput label="x" type="text" inputMode="decimal" value={bx} onChange={(e) => onBxChange(e.target.value)} />
            <ToolInput label="y" type="text" inputMode="decimal" value={by} onChange={(e) => onByChange(e.target.value)} />
            <ToolInput label="z" type="text" inputMode="decimal" value={bz} onChange={(e) => onBzChange(e.target.value)} />
          </div>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("zHint")}</p>
      </div>
    </SectionCard>
  );
}
