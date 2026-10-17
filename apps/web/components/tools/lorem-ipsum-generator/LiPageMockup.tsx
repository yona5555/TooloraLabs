"use client";
import { useTranslations } from "next-intl";
import { greekLines, SEGMENT_FILLS } from "./liMath";
import { useLiLive } from "./LiLiveContext";

const W = 176;
const H = 214;
const PAD = 12;
const CAPACITY = 34;
const LINE = 8;
const BAR = 4;
const PARA_GAP = 5;
const MAX_LINES = 20;
const UNIT = (W - PAD * 2) / CAPACITY;

/** Greeked page preview (§31 wireframe): the generated text as a layout tool shows placeholder copy — one bar per word, one colour per sentence. Click a paragraph to select it. */
export default function LiPageMockup() {
  const t = useTranslations("tools.lorem-ipsum-generator.live.page");
  const { analysis, activeParagraph, selectParagraph, f } = useLiLive();
  const { lines, total } = greekLines(analysis, CAPACITY, MAX_LINES);
  const placed: ((typeof lines)[number] & { y: number })[] = [];
  let y = PAD + 18;
  for (let i = 0; i < lines.length; i++) {
    if (i > 0 && lines[i].paragraph !== lines[i - 1].paragraph) y += PARA_GAP;
    placed.push({ ...lines[i], y });
    y += LINE;
  }
  const visible = placed.filter((l) => l.y + BAR <= H - PAD).length;
  const fits = visible === total;

  return (
    <div data-preview="visual" className="flex shrink-0 flex-col items-center gap-2 sm:w-[184px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={10} className="fill-white stroke-zinc-200 dark:fill-zinc-800/60 dark:stroke-zinc-700" />
        <rect x={PAD} y={PAD} width={W * 0.48} height={7} rx={3.5} className="fill-zinc-800 dark:fill-zinc-200" />
        <rect x={PAD + W * 0.5} y={PAD + 1.5} width={W * 0.16} height={4} rx={2} className="fill-zinc-300 dark:fill-zinc-600" />
        {placed.map((line, li) => {
          if (line.y + BAR > H - PAD) return null;
          const on = activeParagraph === line.paragraph;
          return (
            <g
              key={`${line.paragraph}-${li}`}
              className="cursor-pointer"
              onClick={() => selectParagraph(on ? null : line.paragraph)}
              opacity={activeParagraph === null || on ? 1 : 0.35}
              style={{ transition: "opacity 200ms ease" }}
            >
              <rect x={PAD - 2} y={line.y - 2} width={W - PAD * 2 + 4} height={LINE} fill="transparent" />
              {line.words.map((w, wi) => (
                <rect
                  key={wi}
                  x={PAD + w.x * UNIT}
                  y={line.y}
                  width={Math.max(1, w.w * UNIT)}
                  height={BAR}
                  rx={2}
                  className={on ? "fill-amber-500 dark:fill-amber-400" : SEGMENT_FILLS[w.sentence % SEGMENT_FILLS.length]}
                  style={{ transition: "x 300ms ease, width 300ms ease", animation: "li-bar-in 380ms ease both", animationDelay: `${Math.min(li, 20) * 18}ms` }}
                />
              ))}
            </g>
          );
        })}
        {!fits && <rect x={0} y={H - 30} width={W} height={29} rx={10} className="fill-white/80 dark:fill-zinc-900/70" />}
        {!fits && (
          <text x={W / 2} y={H - 12} textAnchor="middle" fontSize={9} fontWeight={600} className="fill-zinc-500 dark:fill-zinc-400">
            {t("more", { n: f(total - visible) })}
          </text>
        )}
        <style>{`@keyframes li-bar-in { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: none; } }`}</style>
      </svg>
      <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400">{t("caption", { lines: f(total), paragraphs: f(analysis.paragraphs.length) })}</p>
    </div>
  );
}
