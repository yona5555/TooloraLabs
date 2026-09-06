type DigitHighlightDiagramProps = {
  digits: { char: string; significant: boolean }[];
  significantLabel: string;
  notSignificantLabel: string;
  caption: string;
};

export default function DigitHighlightDiagram({ digits, significantLabel, notSignificantLabel, caption }: DigitHighlightDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center">
        <div className="flex gap-1 font-mono text-2xl font-bold">
          {digits.map((d, i) => (
            <span
              key={i}
              className={
                d.char === "."
                  ? "text-current opacity-60"
                  : d.significant
                    ? "rounded bg-blue-600 px-1.5 text-white dark:bg-blue-500"
                    : "rounded bg-zinc-100 px-1.5 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
              }
            >
              {d.char}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500" />
          {significantLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          {notSignificantLabel}
        </span>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
