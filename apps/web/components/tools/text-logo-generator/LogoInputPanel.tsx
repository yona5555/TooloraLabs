"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { TEXT_LOGO_STYLES, TextLogoCalculator as LogoTool } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { useTlLive } from "./TlLiveContext";

const tool = new LogoTool();
const KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const SAMPLES = ["Toolora Labs 2026", "Hello World", "QUANTUM 42", "Café Zürich"];

export default function LogoInputPanel() {
  const t = useTranslations("tools.text-logo-generator.form");
  const tl = useTranslations("tools.text-logo-generator.live");
  const { text, setText, sample, reset, appendChar, source, active, activeStyle, setActiveStyle, styleName, ok, plain, f } = useTlLive();
  const keyMap = useMemo(() => {
    const styled = Array.from(tool.execute({ text: KEYS, style: activeStyle }, { locale: "en-US" }).data.styledText);
    return Array.from(KEYS).map((key, i) => ({ key, glyph: styled[i] }));
  }, [activeStyle]);
  const used = useMemo(() => new Set(Array.from(source)), [source]);
  const samples = SAMPLES.includes(sample) ? SAMPLES : [sample, ...SAMPLES];

  return (
    <SectionCard phoneRole="input" title={t("inputTitle")} className="lg:flex lg:h-full lg:flex-col" bodyClassName="p-4 lg:p-6 lg:flex lg:flex-1 lg:flex-col">
      <ToolInput label={t("textLabel")} type="text" dir="auto" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("textPlaceholder")} />
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {samples.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setText(s)}
            aria-pressed={text === s}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              text === s ? "border-blue-400 bg-blue-600 text-white" : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={reset}
        className="mt-4 flex items-center gap-2 self-start rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={16} />
        {t("clear")}
      </button>

      <div className="mt-5 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700 lg:flex lg:flex-1 lg:flex-col">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{tl("keys.title")}</span>
          <select
            value={activeStyle}
            onChange={(e) => setActiveStyle(e.target.value as typeof activeStyle)}
            aria-label={tl("keys.style")}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {TEXT_LOGO_STYLES.map((s) => (
              <option key={s} value={s}>
                {styleName(s)}
              </option>
            ))}
          </select>
        </div>
        <div dir="ltr" className="mt-2 grid grid-cols-9 gap-1 lg:flex-1 lg:content-start">
          {keyMap.map(({ key, glyph }) => {
            const on = used.has(key);
            const missing = glyph === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => appendChar(key)}
                title={`${key} → ${glyph}`}
                className={`flex h-8 items-center justify-center rounded-md border text-base transition-colors ${
                  on
                    ? "border-amber-400 bg-amber-100 text-zinc-900 dark:border-amber-400/70 dark:bg-amber-500/15 dark:text-zinc-50"
                    : missing
                      ? "border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
                      : "border-zinc-200 text-zinc-700 hover:bg-blue-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-blue-500/10"
                }`}
              >
                {glyph}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">{tl("keys.legend")}</p>
      </div>

      <p dir="auto" className="mt-4 rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400 lg:mt-3">
        {ok ? tl("inputFooter", { chars: f(plain.characters), mapped: f(active.mapped), style: styleName(active.style) }) : tl("inputHint")}
      </p>
    </SectionCard>
  );
}
