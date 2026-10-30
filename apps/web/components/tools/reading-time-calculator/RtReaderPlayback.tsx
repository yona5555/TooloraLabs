"use client";
import { useRef, useState } from "react";
import { useMotionLoop } from "@/components/tool-ui/motion/motion";
import { useTranslations } from "next-intl";
import { Pause, Play, RotateCcw } from "lucide-react";
import RtIndicatorCard from "./RtIndicatorCard";
import { readerWordIndex, SEGMENT_FILLS } from "./rtMath";
import { useRtLive } from "./RtLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 132;
const PAD = 14;
const BAR_Y = 34;
const BAR_H = 34;
const SENT_Y = 76;
const AXIS_Y = 100;
const MAX_TICKS = 8;
const TICK_STEPS = [5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600];
/** Fast-forward so a full playback lasts between 6 and 18 real seconds. */
const playbackSeconds = (total: number) => Math.min(18, Math.max(6, total / 12));

/** The last span whose first word is at or before word `idx`. */
function spanAt<T extends { wordStart: number }>(spans: T[], idx: number): T | undefined {
  let found = spans[0];
  for (const s of spans) {
    if (s.wordStart > idx) break;
    found = s;
  }
  return found;
}

/** Timeline with Stations (§31 #9) + playback: a simulated reader moves through the text at the chosen pace and lights up its word in the textarea. */
export default function RtReaderPlayback() {
  const t = useTranslations("tools.reading-time-calculator.live.playback");
  const { wpm, tokens, paragraphs, sentences, reader, setReader, secondsFor, f, pct, clock } = useRtLive();
  const [speed, setSpeed] = useState(wpm);
  const [playing, setPlaying] = useState(false);
  const [followedWpm, setFollowedWpm] = useState(wpm);
  // Follow the input panel's speed whenever it changes there (state adjusted during render, no effect).
  if (followedWpm !== wpm) {
    setFollowedWpm(wpm);
    setSpeed(wpm);
    setPlaying(false);
  }
  const words = tokens.length;
  const total = secondsFor(words, speed);
  // The reader keeps its word when the pace changes: convert its position to this pace.
  const at = reader ? Math.min(total, (reader.seconds * reader.wpm) / speed) : 0;
  const frame = useRef({ pos: 0 });
  const box = useRef<SVGSVGElement>(null);

  // tool-ui/motion: plays only after the visitor presses Play and ends at the last word; paused off screen or
  // with the page hidden; reduced motion stops it at once (the reader stays where it is).
  const sincePush = useRef(0);
  useMotionLoop(box, (dt) => {
    const state = frame.current;
    state.pos = Math.min(total, state.pos + dt * (total / playbackSeconds(total)));
    sincePush.current += dt;
    if (sincePush.current > 0.06 || state.pos >= total) {
      sincePush.current = 0;
      setReader({ seconds: state.pos, wpm: speed });
    }
    return state.pos < total;
  }, playing && total > 0, () => setPlaying(false));

  const changeSpeed = (next: number) => {
    // Mid-playback the running position is kept on the same word at the new pace.
    if (playing) frame.current.pos = (frame.current.pos * speed) / next;
    setSpeed(next);
  };

  const togglePlay = () => {
    if (!playing) frame.current.pos = at >= total ? 0 : at;
    setPlaying(!playing);
  };

  const x = (sec: number) => PAD + (total > 0 ? sec / total : 0) * (W - PAD * 2);
  const xw = (wordIdx: number) => PAD + (words > 0 ? wordIdx / words : 0) * (W - PAD * 2);
  const idx = readerWordIndex(at, speed, words);
  const para = spanAt(paragraphs, idx);
  const sent = spanAt(sentences, idx);
  const tickEvery = TICK_STEPS.find((step) => total / step <= MAX_TICKS) ?? Math.ceil(total / MAX_TICKS / 3600) * 3600;
  const ticks = Array.from({ length: Math.floor(total / tickEvery) + 1 }, (_, i) => i * tickEvery);

  const scrub = (sec: number) => {
    setPlaying(false);
    setReader({ seconds: sec, wpm: speed });
  };

  const indicator = (
    <div className="w-full sm:w-[340px]">
      <svg ref={box} direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <text style={{ fontSize: svgPx(12) }} x={PAD} y={BAR_Y - 8} fontWeight={600} className="fill-zinc-500 dark:fill-zinc-400">{t("paragraphsRow")}</text>
        {paragraphs.map((p, i) => (
          <rect
            key={p.index}
            x={xw(p.wordStart)}
            y={BAR_Y}
            width={Math.max(1, xw(p.wordStart + p.words) - xw(p.wordStart) - 1.5)}
            height={BAR_H}
            rx={4}
            className={`cursor-pointer ${SEGMENT_FILLS[i % SEGMENT_FILLS.length]} ${p === para && reader ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
            style={{ transition: "x 300ms ease, width 300ms ease" }}
            onClick={() => scrub(secondsFor(p.wordStart, speed))}
          >
            <title>{t("paragraphTitle", { n: f(i + 1), time: clock(secondsFor(p.wordStart, speed)) })}</title>
          </rect>
        ))}
        {paragraphs.map((p, i) =>
          xw(p.wordStart + p.words) - xw(p.wordStart) > 24 ? (
            <text style={{ fontSize: svgPx(12) }} key={`l${p.index}`} x={xw(p.wordStart) + 5} y={BAR_Y + 21} fontWeight={700} className="pointer-events-none fill-white">
              {`¶${f(i + 1)}`}
            </text>
          ) : null,
        )}
        <rect x={PAD} y={BAR_Y} width={Math.max(0, x(at) - PAD)} height={BAR_H} rx={4} className="pointer-events-none fill-white/35 dark:fill-zinc-900/45" />
        {sentences.map((s) => (
          <line key={s.index} x1={xw(s.wordStart)} y1={SENT_Y - 5} x2={xw(s.wordStart)} y2={SENT_Y + 5} className={s === sent && reader ? "stroke-amber-500" : "stroke-zinc-400 dark:stroke-zinc-500"} strokeWidth={s === sent && reader ? 2.5 : 1} />
        ))}
        <line x1={PAD} y1={SENT_Y} x2={W - PAD} y2={SENT_Y} className="stroke-zinc-300 dark:stroke-zinc-600" />
        <text style={{ fontSize: svgPx(12) }} x={W - PAD} y={SENT_Y - 8} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">{t("sentencesRow")}</text>
        <line x1={PAD} y1={AXIS_Y} x2={W - PAD} y2={AXIS_Y} className="stroke-zinc-300 dark:stroke-zinc-600" />
        {ticks.map((m) => (
          <g key={m} style={{ transform: `translateX(${x(m)}px)`, transition: "transform 300ms ease" }}>
            <line x1={0} y1={AXIS_Y} x2={0} y2={AXIS_Y + 5} className="stroke-zinc-400 dark:stroke-zinc-500" />
            <text style={{ fontSize: svgPx(12) }} x={0} y={AXIS_Y + 16} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">{clock(m)}</text>
          </g>
        ))}
        <g style={{ transform: `translateX(${x(at)}px)`, transition: playing ? "none" : "transform 200ms ease" }}>
          <line x1={0} y1={BAR_Y - 4} x2={0} y2={AXIS_Y} strokeWidth={2} className="stroke-amber-500 dark:stroke-amber-400" />
          <circle cx={0} cy={BAR_Y - 6} r={5} className="fill-amber-500 dark:fill-amber-400" />
        </g>
      </svg>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? t("pause") : t("play")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            setReader(null);
          }}
          aria-label={t("restart")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RotateCcw size={14} />
        </button>
        <input
          type="range"
          min={0}
          max={Math.max(1, Math.round(total))}
          step={1}
          value={Math.round(at)}
          onChange={(e) => scrub(Number(e.target.value))}
          aria-label={t("scrub")}
          className="w-full accent-amber-500"
        />
        <span dir="ltr" className="shrink-0 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-200">
          {clock(at)} / {clock(total)}
        </span>
      </div>
      <label className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="shrink-0">{t("pace", { wpm: f(speed) })}</span>
        <input type="range" min={100} max={600} step={10} value={speed} onChange={(e) => changeSpeed(Number(e.target.value))} className="w-full accent-blue-600" aria-label={t("paceLabel")} />
      </label>
      <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{t("hint", { x: f(total / playbackSeconds(total), 0) })}</p>
    </div>
  );

  return (
    <RtIndicatorCard
      phoneRole="extra"
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("position"), value: clock(at), note: t("positionNote", { wpm: f(speed) }) },
        { label: t("word"), value: `${f(Math.max(0, idx) + 1)} / ${f(words)}`, note: `${clock(at)} × ${f(speed)} ÷ ${f(60)}` },
        { label: t("paragraph"), value: para ? `¶${f(para.index + 1)}` : "—" },
        { label: t("sentence"), value: sent ? f(sent.index + 1) : "—" },
        { label: t("remaining"), value: clock(Math.max(0, total - at)) },
        { label: t("progress"), value: pct(total > 0 ? at / total : 0), emphasize: true },
      ]}
    />
  );
}
