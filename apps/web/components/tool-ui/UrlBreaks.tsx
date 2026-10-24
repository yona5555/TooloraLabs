import { Fragment, type ReactNode } from "react";

/** A URL is not a word: it may wrap only after its separators, never mid-word. */
export function urlWithBreaks(url: string): ReactNode {
  return url.split(/(?<=[/.?=&_-])/).map((part, i) => (
    <Fragment key={i}>
      {part}
      <wbr />
    </Fragment>
  ));
}

const URL_TOKEN = /(https?:\/\/\S+|www\.\S+)/;

/** Prose with URLs inside: every URL gets wrap points after its separators; the rest is unchanged. */
export function textWithUrlBreaks(text: string): ReactNode {
  if (!URL_TOKEN.test(text)) return text;
  return text.split(URL_TOKEN).map((part, i) => (i % 2 ? <Fragment key={i}>{urlWithBreaks(part)}</Fragment> : part));
}
