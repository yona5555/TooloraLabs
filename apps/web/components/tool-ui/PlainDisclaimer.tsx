type PlainDisclaimerProps = {
  text: string;
};

/**
 * Plain-text closing disclaimer — same register as any other paragraph on
 * the page (no colored background, no border, no warning icon). Deliberately
 * unobtrusive: the legal/educational caveat still needs to be present, but a
 * loud amber warning box overstates the risk of a savings or loan estimate
 * and reads as an error state it isn't.
 */
export default function PlainDisclaimer({ text }: PlainDisclaimerProps) {
  return <p className="mt-2 text-center text-xs leading-6 text-zinc-500 dark:text-zinc-400">{text}</p>;
}
