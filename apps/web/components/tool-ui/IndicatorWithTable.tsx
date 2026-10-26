"use client";
import { Fragment, type ReactNode } from "react";
import { hasWords, MixedText, Subs } from "./MixedText";
import { useGapFreeSplit, type GapLayout } from "./useGapFreeSplit";

type Row = { label: string; value: string; emphasize?: boolean; note?: string };

type Props = {
  /** The chart/diagram/gauge itself. */
  indicator: ReactNode;
  /** Heading text above the WORKED EXAMPLE row list ("Worked Example" in the active locale). */
  workedExampleTitle: string;
  rows: Row[];
  /** Set when `indicator` already manages its own dir="ltr" internally (e.g. a gauge with numeric ticks) — leaves the wrapper's own direction alone either way, since this component never forces one. */
  className?: string;
  /**
   * Leave unset: the card measures itself and keeps its side-by-side layout unless that leaves an
   * empty gap, then switches to the first remedy without one (see useGapFreeSplit). Pin a layout
   * only for a card reviewed by hand.
   */
  layout?: GapLayout;
};

/**
 * A long worked formula ("v = 0 + 2 × 2.5 = 5 m/s") as whole pieces split before each " = ", so a
 * narrow card wraps it between the steps and never inside a value or term.
 */
function FormulaPieces({ text }: { text: string }) {
  if (text.length <= 24 || hasWords(text) || !text.includes(" = ")) return <MixedText text={text} />;
  return text.split(/ (?== )/).map((piece, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span>
        <MixedText text={piece} />
      </span>
    </Fragment>
  ));
}

/** A dl when no row carries a note; a note line under a row cannot sit in a dl group (div > dt + dd),
 *  so a list with notes is plain divs, laid out exactly the same. */
const hasNotes = (rows: Row[]) => rows.some((r) => r.note);

function RowList({ rows, className, children }: { rows: Row[]; className: string; children: ReactNode }) {
  return hasNotes(rows) ? <div className={className}>{children}</div> : <dl className={className}>{children}</dl>;
}

function RowView({ row, className = "", asDivs = false }: { row: Row; className?: string; asDivs?: boolean }) {
  const Label = asDivs ? "div" : "dt";
  const Value = asDivs ? "div" : "dd";
  const pair = (
    <>
      <Label className="text-zinc-500 dark:text-zinc-400">
        <Subs text={row.label} />
      </Label>
      {/* Words (e.g. Arabic "not reached") keep the sans font: monospace breaks Arabic letter joining. */}
      <Value
        dir={hasWords(row.value) ? "auto" : "ltr"}
        className={`ms-auto max-w-full text-end font-semibold lg:ms-0 ${row.emphasize ? "text-base text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-100"}`}
      >
        <FormulaPieces text={row.value} />
      </Value>
    </>
  );
  // a value too long to sit beside its label drops under it (label above value)
  const line = "flex flex-wrap items-baseline justify-between gap-x-3 lg:flex-nowrap lg:gap-3";
  // In a dl the row itself is the div group (div > dt + dd, the only nesting HTML allows).
  if (!asDivs) return <div className={`${line} ${className}`}>{pair}</div>;
  return (
    <div className={className}>
      <div className={line}>{pair}</div>
      {row.note && <p className="text-end text-xs text-zinc-400 dark:text-zinc-500"><Subs text={row.note} /></p>}
    </div>
  );
}

/**
 * Site-wide reference layout for "one indicator + its own WORKED EXAMPLE table," side by side
 * (`shrink-0` on the indicator, `flex-1` on the table, one flex row that only wraps to a column
 * on narrow viewports), or stacked when pinned for a card whose side-by-side form left a gap.
 *
 * Deliberately carries no `dir="ltr"` of its own: a plain HTML flex row reverses its visual order
 * under `dir="rtl"`, so the conceptual order mirrors correctly on Arabic pages. A caller whose
 * indicator is itself numeric/directional keeps `dir="ltr"` scoped to just that inner element.
 * `data-split` / `data-part` mark the parts for scripts/card-gap-check.mjs.
 */
export default function IndicatorWithTable({ indicator, workedExampleTitle, rows, className = "", layout: pinned }: Props) {
  const { layout, boxRef, indicatorRef, tableRef } = useGapFreeSplit(pinned);
  const title = <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">{workedExampleTitle}</p>;

  if (layout === "stacked") {
    const plain = rows.filter((r) => !r.emphasize);
    const result = rows.filter((r) => r.emphasize);
    return (
      <div ref={boxRef} data-split="stacked" className={`flex flex-col gap-4 ${className}`}>
        <div data-part="drawing" className="flex min-w-0 justify-center">
          <div ref={indicatorRef} data-preview="visual" className="w-full min-w-0 [&_[data-gfr-wrap]]:w-full [&_[data-gfr-wrap]]:max-w-none [&_[data-gfr-main]]:h-auto [&_[data-gfr-main]]:w-full [&_[data-gfr-main]]:max-w-none">
            {indicator}
          </div>
        </div>
        <div ref={tableRef} data-part="table" className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/40">
          {title}
          <RowList rows={plain} className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {plain.map((row, i) => (
              <RowView key={i} row={row} asDivs={hasNotes(plain)} />
            ))}
          </RowList>
          {result.length > 0 && (
            <RowList rows={result} className="mt-3 space-y-2 border-t border-zinc-200 pt-2 text-sm dark:border-zinc-700">
              {result.map((row, i) => (
                <RowView key={i} row={row} asDivs={hasNotes(result)} />
              ))}
            </RowList>
          )}
        </div>
      </div>
    );
  }

  const twoCol = layout === "side-2col";
  // Stretch only when a remedy is active, so the table can spread its rows to the drawing's height.
  const stretch = layout !== "side";
  return (
    <div ref={boxRef} data-split="side" className={`flex flex-col gap-6 lg:flex-row ${stretch ? "lg:items-stretch" : "lg:items-center"} ${className}`}>
      <div data-part="drawing" className={`min-w-0 shrink-0 ${stretch ? "lg:flex lg:items-center lg:justify-center" : ""}`}>
        <div ref={indicatorRef} data-preview="visual" className="min-w-0">{indicator}</div>
      </div>
      <div ref={tableRef} data-part="table" className={`min-w-[200px] flex-1 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/40 ${stretch ? "lg:flex lg:flex-col" : ""}`}>
        {title}
        <RowList rows={rows} className={`mt-3 text-sm ${twoCol ? "grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:flex-1 lg:content-between" : stretch ? "space-y-2 lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:space-y-0 lg:gap-2" : "space-y-2"}`}>
          {rows.map((row, i) => (
            <RowView key={i} row={row} asDivs={hasNotes(rows)} className={row.emphasize ? `border-t border-zinc-200 pt-2 dark:border-zinc-700 ${twoCol ? "sm:col-span-2" : ""}` : ""} />
          ))}
        </RowList>
      </div>
    </div>
  );
}
