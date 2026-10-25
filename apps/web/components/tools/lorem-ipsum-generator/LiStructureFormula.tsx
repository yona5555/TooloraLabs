"use client";
import { useTranslations } from "next-intl";
import { LOREM_SENTENCES_PER_PARAGRAPH as SPP, LOREM_WORDS_PER_SENTENCE as WPS } from "@tooloralabs/tools";
import LiIndicatorCard from "./LiIndicatorCard";
import { useLiLive } from "./LiLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 330;
const PAD = 14;
const BAR_Y = 30;
/** Words in "Lorem ipsum dolor sit amet, consectetur adipiscing elit." */
const OPENING_WORDS = 8;

/** Formula Diagram (§31 #18): how the settings bound the word count — count × sentences × words — and where this text landed in that range. */
export default function LiStructureFormula() {
  const tq = useTranslations("tools.lorem-ipsum-generator.quickReference");
  const t = useTranslations("tools.lorem-ipsum-generator.live.formula");
  const tf = useTranslations("tools.lorem-ipsum-generator.form");
  const { result, range, unit, style, startWithLorem, countValue, f, pct } = useLiLive();
  if (!range) return <LiIndicatorCard title={tq("title")} intro={tq("intro")} indicator={null} rows={[]} />;

  const opening = startWithLorem && style === "classic" && unit !== "words";
  const words = result.wordCount;
  const span = range.max - range.min;
  const x = (v: number) => PAD + (span > 0 ? (v - range.min) / span : 0.5) * (W - PAD * 2);
  const deviation = range.expected ? (words - range.expected) / range.expected : 0;

  const chips = [
    { key: "count", label: tf("countLabel"), value: f(countValue), tone: "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200" },
    ...(unit === "paragraphs"
      ? [{ key: "spp", label: tq("sentencesPerParagraphLabel"), value: `${f(SPP.min)}–${f(SPP.max)}`, tone: "border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200" }]
      : []),
    ...(unit !== "words"
      ? [{ key: "wps", label: tq("wordsPerSentenceLabel"), value: `${f(WPS.min)}–${f(WPS.max)}`, tone: "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200" }]
      : []),
    ...(opening ? [{ key: "opening", label: t("opening"), value: `+${f(OPENING_WORDS)}`, tone: "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200" }] : []),
  ];

  const indicator = (
    <div className="w-full sm:w-[330px]">
      <ol className="space-y-1.5">
        {chips.map((c, i) => (
          <li key={c.key} className="flex items-center gap-2">
            <span dir="ltr" className="w-6 shrink-0 text-center font-mono text-sm font-bold text-zinc-400 dark:text-zinc-500">{i === 0 ? "" : c.key === "opening" ? "+" : "×"}</span>
            <span className={`flex flex-1 items-center justify-between gap-2 rounded-lg border px-3 py-1.5 ${c.tone}`}>
              <span className="text-xs font-medium">{c.label}</span>
              <span dir="ltr" className="font-mono text-base font-bold tabular-nums">{c.value}</span>
            </span>
          </li>
        ))}
      </ol>
      <svg direction="ltr" width={W} height={64} viewBox={`0 0 ${W} 64`} role="img" aria-label={t("aria")} className="mt-3 block max-w-full">
        <rect x={PAD} y={BAR_Y} width={W - PAD * 2} height={10} rx={5} className="fill-zinc-200 dark:fill-zinc-700" />
        <rect x={PAD} y={BAR_Y} width={Math.max(0, x(words) - PAD)} height={10} rx={5} className="fill-blue-600 dark:fill-blue-500" style={{ transition: "width 350ms ease" }} />
        <line x1={x(range.expected)} y1={BAR_Y - 6} x2={x(range.expected)} y2={BAR_Y + 16} strokeDasharray="3 2" strokeWidth={1.5} className="stroke-zinc-500 dark:stroke-zinc-400" />
        <text style={{ fontSize: svgPx(12) }} x={x(range.expected)} y={BAR_Y - 9} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">{t("expectedTick", { n: f(range.expected, 0) })}</text>
        <g style={{ transform: `translateX(${x(words)}px)`, transition: "transform 350ms cubic-bezier(.3,1.4,.5,1)" }}>
          <circle cx={0} cy={BAR_Y + 5} r={7} strokeWidth={2} className="fill-amber-400 stroke-white dark:stroke-zinc-900" />
        </g>
        <text style={{ fontSize: svgPx(12) }} x={PAD} y={BAR_Y + 26} className="fill-zinc-500 dark:fill-zinc-400">{f(range.min)}</text>
        <text style={{ fontSize: svgPx(12) }} x={W - PAD} y={BAR_Y + 26} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">{f(range.max)}</text>
      </svg>
      <p className="mt-1 text-center text-[11px] text-zinc-500 dark:text-zinc-400">{t("legend", { words: f(words) })}</p>
    </div>
  );

  const rows =
    unit === "words"
      ? [
          { label: t("min"), value: f(range.min) },
          { label: t("max"), value: f(range.max) },
          { label: t("actual"), value: f(words), emphasize: true, note: t("exact") },
        ]
      : [
          { label: t("min"), value: f(range.min), note: formula(unit, opening ? f(OPENING_WORDS) : null, f(countValue), f(SPP.min), f(WPS.min)) },
          { label: t("max"), value: f(range.max), note: formula(unit, opening ? f(OPENING_WORDS) : null, f(countValue), f(SPP.max), f(WPS.max)) },
          { label: t("expected"), value: f(range.expected, 1), note: formula(unit, opening ? f(OPENING_WORDS) : null, f(countValue), f((SPP.min + SPP.max) / 2, 1), f((WPS.min + WPS.max) / 2, 1)) },
          { label: t("deviation"), value: `${deviation >= 0 ? "+" : ""}${pct(deviation)}`, note: `(${f(words)} − ${f(range.expected, 1)}) ÷ ${f(range.expected, 1)}` },
          { label: t("actual"), value: f(words), emphasize: true },
        ];

  return <LiIndicatorCard title={tq("title")} intro={tq("intro")} indicator={indicator} rows={rows} />;
}

/** "count × sentences × words (+ 8)" with the opening sentence replacing one random sentence in sentence mode. */
function formula(unit: string, opening: string | null, count: string, spp: string, wps: string): string {
  if (unit === "sentences") return opening ? `${opening} + (${count} − 1) × ${wps}` : `${count} × ${wps}`;
  return `${opening ? `${opening} + ` : ""}${count} × ${spp} × ${wps}`;
}
