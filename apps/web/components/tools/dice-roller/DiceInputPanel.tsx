"use client";
import { useTranslations } from "next-intl";
import { Dices } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { FACE_OPTIONS } from "./types";
import type { DiceFaces } from "./types";

type Props = {
  diceCount: string;
  onDiceCountChange: (value: string) => void;
  faces: DiceFaces;
  onFacesChange: (value: DiceFaces) => void;
  onRoll: () => void;
  isRolling: boolean;
};

export default function DiceInputPanel({
  diceCount,
  onDiceCountChange,
  faces,
  onFacesChange,
  onRoll,
  isRolling,
}: Props) {
  const t = useTranslations("tools.dice-roller.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-4">
        <ToolInput
          label={t("diceCountLabel")}
          type="text"
          inputMode="numeric"
          value={diceCount}
          onChange={(e) => onDiceCountChange(e.target.value)}
        />

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("facesLabel")}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {FACE_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onFacesChange(f)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                  faces === f
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                d{f}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onRoll}
          disabled={isRolling}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          <Dices size={18} className={isRolling ? "animate-spin" : ""} />
          {isRolling ? t("rolling") : t("rollButton")}
        </button>
      </div>
    </SectionCard>
  );
}
