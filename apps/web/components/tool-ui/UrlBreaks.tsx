import { Fragment, type ReactNode } from "react";

/** A URL is not a word: it may wrap only after its separators, never mid-word. `phoneOnly`: the
 *  wrap points exist only below md (a zero-width space in a span hidden from md up), so wider layouts
 *  keep the browser's own wrapping. */
export function urlWithBreaks(url: string, phoneOnly = false): ReactNode {
  return url.split(/(?<=[/.?=&_-])/).map((part, i) => (
    <Fragment key={i}>
      {part}
      {phoneOnly ? <span className="md:hidden">{"\u200B"}</span> : <wbr />}
    </Fragment>
  ));
}

const URL_TOKEN = /(https?:\/\/\S+|www\.\S+)/;

/** Prose with URLs inside: below md every URL gets wrap points after its separators; the rest, and
 *  every width from md up, is unchanged. */
export function textWithUrlBreaks(text: string): ReactNode {
  if (!URL_TOKEN.test(text)) return text;
  return text.split(URL_TOKEN).map((part, i) => (i % 2 ? <Fragment key={i}>{urlWithBreaks(part, true)}</Fragment> : part));
}
