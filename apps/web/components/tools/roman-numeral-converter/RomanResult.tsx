"use client";
import { Hand } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import RomanShareExportModal from "./RomanShareExportModal";
import RomanScene from "./RomanScene";
import { additive, ROMAN_SEED } from "./romanMath";
import type { RomanNumeralOutput, RomanConversionDirection } from "./types";

type Props = {
  result: RomanNumeralOutput;
  direction: RomanConversionDirection;
  digitStyle: DigitStyle;
  /** The board's value: the current result, or the last valid one while the field is invalid. */
  boardValue: number;
  onSetValue: (v: number) => void;
};

/**
 * §44 (2D): the Result card carries the counting board at its top (directly under the header
 * band), then the converted value and its sentence, all inside this one card.
 */
export default function RomanResult({ result, direction, digitStyle, boardValue, onSetValue }: Props) {
  const t = useTranslations("tools.roman-numeral-converter.result");
  const t2 = useTranslations("tools.roman-numeral-converter");
  const tc = useTranslations("toolPage.indicatorKit");

  const invalid = result.error || result.romanValue === null || result.arabicValue === null;
  const messageKey = result.error === "empty-input" ? "emptyInput" : result.error === "out-of-range" ? "outOfRange" : "invalidRoman";
  const formattedArabic = invalid ? "" : formatLocalizedNumber(result.arabicValue as number, digitStyle);
  const isToRoman = direction === "toRoman";
  const heroValue = invalid ? "" : isToRoman ? (result.romanValue as string) : formattedArabic;
  const sentence = invalid ? "" : isToRoman ? `${formattedArabic} = ${result.romanValue}` : `${result.romanValue} = ${formattedArabic}`;

  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal lg:flex-1" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard phoneRole="output"
        id="roman-result"
        title={t("heading")}
        className="flex flex-col lg:flex-1"
        bodyClassName="flex flex-1 flex-col p-4 lg:p-6"
        action={
          <span className="flex items-center gap-2">
            <span role="img" aria-label={tc("interactive")} title={tc("interactive")} data-ph-interactive className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Hand size={15} aria-hidden />
            </span>
            {!invalid && (
              <>
                <CopyButton text={heroValue} className="!text-white dark:!text-white" />
                <RomanShareExportModal
                  operationLabel={isToRoman ? t2("form.toRoman") : t2("form.toArabic")}
                  inputRows={[{ label: isToRoman ? t2("form.arabicLabel") : t2("form.romanLabel"), value: isToRoman ? formattedArabic : (result.romanValue as string) }]}
                  resultRows={[{ label: t("heading"), value: heroValue }]}
                  heroLabel={t("heading")}
                  heroValue={heroValue}
                  sentence={sentence}
                />
              </>
            )}
          </span>
        }
      >
        <RomanScene value={boardValue} seed={ROMAN_SEED} onSet={onSetValue} />

        <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />

        <div data-ph-result-values>
          {invalid ? (
            <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
          ) : (
            <>
              <p dir="ltr" data-testid="roman-result-main" className="text-center text-4xl font-bold tracking-wide text-blue-700 dark:text-blue-300">
                {heroValue}
              </p>
              <p dir="ltr" className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-300">
                {sentence}
              </p>
              {/* The standard (subtractive) spelling against the purely additive one, with symbol counts. */}
              <dl className="mt-4 grid gap-1.5 text-sm" data-testid="roman-forms">
                {[
                  { k: "standardForm", v: result.romanValue as string },
                  { k: "additiveForm", v: additive(result.arabicValue as number) },
                ].map(({ k, v }) => (
                  <div key={k} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2" style={{ background: "var(--glass-table-wrap-bg)" }}>
                    <dt style={{ color: "var(--ph-ink-muted)" }}>{t(k)}</dt>
                    <dd dir="ltr" className="m-0 text-end font-semibold tracking-wide" style={{ color: "var(--ph-ink)" }}>
                      {v} <span className="text-xs font-medium tabular-nums" style={{ color: "var(--ph-ink-muted)" }}>({t("symbols", { n: v.length })})</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
