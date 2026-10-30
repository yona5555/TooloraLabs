"use client";
import { useEffect, useRef, useState } from "react";
import { useMotionLoop } from "@/components/tool-ui/motion/motion";
import { useTranslations } from "next-intl";
import { Pause, Play, RotateCcw } from "lucide-react";
import SwIndicatorCard from "./SwIndicatorCard";
import { spanAt, speakerWordIndex } from "./swMath";
import { useSwLive } from "./SwLiveContext";

const PLAY_RATES = [1, 2, 4, 8] as const;
const MIN_PACE = 80;
const MAX_PACE = 220;

/** Teleprompter rehearsal (§31 wow piece): the speech scrolls sentence by sentence at a chosen pace, the spoken word lights up here and in your text. */
export default function SwTeleprompter() {
  const t = useTranslations("tools.speech-word-count-calculator.live.prompter");
  const { text, wpm, tokens, sentences, paragraphs, speaker, setSpeaker, secondsFor, f, pct, clock } = useSwLive();
  const [pace, setPace] = useState(wpm);
  const [rate, setRate] = useState<(typeof PLAY_RATES)[number]>(1);
  const [playing, setPlaying] = useState(false);
  const [followedWpm, setFollowedWpm] = useState(wpm);
  // Follow the input panel's pace whenever it changes there (state adjusted during render, no effect).
  if (followedWpm !== wpm) {
    setFollowedWpm(wpm);
    setPace(Math.min(MAX_PACE, Math.max(MIN_PACE, wpm)));
    setPlaying(false);
  }
  const words = tokens.length;
  const total = secondsFor(words, pace);
  // The speaker keeps its word when the pace changes: convert its position to this pace.
  const at = speaker ? Math.min(total, (speaker.seconds * speaker.wpm) / pace) : 0;
  const frame = useRef({ pos: 0 });
  const lineRef = useRef<HTMLDivElement>(null);

  // tool-ui/motion: plays only after the visitor presses Play and ends at the last word; paused off screen or
  // with the page hidden; reduced motion stops it at once (the speaker stays where it is).
  const sincePush = useRef(0);
  useMotionLoop(lineRef, (dt) => {
    const state = frame.current;
    state.pos = Math.min(total, state.pos + dt * rate);
    sincePush.current += dt;
    if (sincePush.current > 0.05 || state.pos >= total) {
      sincePush.current = 0;
      setSpeaker({ seconds: state.pos, wpm: pace });
    }
    return state.pos < total;
  }, playing && total > 0, () => setPlaying(false));

  const changePace = (next: number) => {
    if (playing) frame.current.pos = (frame.current.pos * pace) / next;
    setPace(next);
  };
  const togglePlay = () => {
    if (!playing) frame.current.pos = at >= total ? 0 : at;
    setPlaying(!playing);
  };
  const scrub = (sec: number) => {
    setPlaying(false);
    setSpeaker({ seconds: sec, wpm: pace });
  };

  const idx = speaker ? speakerWordIndex(at, pace, words) : -1;
  const focusIdx = Math.max(0, idx);
  const sent = spanAt(sentences, focusIdx);
  const para = spanAt(paragraphs, focusIdx);
  const next = sent ? sentences[sent.index + 1] : undefined;
  const sentTokens = sent ? tokens.slice(sent.wordStart, sent.wordStart + sent.words) : [];

  useEffect(() => {
    // Scroll only the prompter window (never the page) so the spoken word stays in view.
    const box = lineRef.current;
    const now = box?.querySelector<HTMLElement>("[data-now]");
    if (box && now) box.scrollTop = Math.max(0, now.offsetTop - box.offsetTop - box.clientHeight / 3);
  }, [idx]);

  // Rebuild the current sentence from the original text so punctuation and spacing stay exactly as written.
  const pieces: { key: string; text: string; state: "said" | "now" | "ahead" | "gap" }[] = [];
  if (sent) {
    let cursor = sent.start;
    sentTokens.forEach((tok, i) => {
      if (tok.start > cursor) pieces.push({ key: `g${i}`, text: text.slice(cursor, tok.start), state: "gap" });
      const wi = sent.wordStart + i;
      pieces.push({ key: `w${i}`, text: text.slice(tok.start, tok.end), state: idx < 0 ? "ahead" : wi < idx ? "said" : wi === idx ? "now" : "ahead" });
      cursor = tok.end;
    });
    if (sent.end > cursor) pieces.push({ key: "tail", text: text.slice(cursor, sent.end), state: "gap" });
  }

  const indicator = (
    <div className="w-full sm:w-[360px]">
      <div className="relative overflow-hidden rounded-xl bg-zinc-900 px-4 py-3 text-zinc-100 shadow-inner dark:bg-black">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-zinc-400">
          <span>{t("sentenceOf", { n: f((sent?.index ?? 0) + 1), total: f(sentences.length) })}</span>
          <span dir="ltr" className="font-mono">{clock(at)} / {clock(total)}</span>
        </div>
        <div ref={lineRef} dir="auto" className="max-h-32 min-h-[5.5rem] overflow-y-auto text-lg font-semibold leading-relaxed">
          {pieces.map((p) =>
            p.state === "gap" ? (
              <span key={p.key} className="whitespace-pre-wrap text-zinc-500">{p.text}</span>
            ) : (
              <span
                key={p.key}
                data-now={p.state === "now" ? "" : undefined}
                className={`rounded px-0.5 transition-colors duration-150 ${p.state === "now" ? "bg-amber-400 text-zinc-900" : p.state === "said" ? "text-zinc-500" : "text-zinc-100"}`}
              >
                {p.text}
              </span>
            ),
          )}
        </div>
        {next && (
          <p dir="auto" className="mt-2 line-clamp-1 border-t border-zinc-700 pt-2 text-xs text-zinc-500">
            {t("next")} {text.slice(next.start, next.end)}
          </p>
        )}
        <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-zinc-700" dir="ltr">
          {paragraphs.map((p) => (
            <button
              key={p.index}
              type="button"
              aria-label={t("jumpParagraph", { n: f(p.index + 1) })}
              onClick={() => scrub(secondsFor(p.wordStart, pace))}
              className="relative h-full border-e border-zinc-900 last:border-0"
              style={{ width: `${words ? (p.words / words) * 100 : 0}%` }}
            >
              <span
                className="absolute inset-y-0 start-0 bg-amber-400"
                style={{ width: `${p.words ? Math.min(100, Math.max(0, ((idx + 1 - p.wordStart) / p.words) * 100)) : 0}%`, transition: playing ? "none" : "width 200ms ease" }}
              />
            </button>
          ))}
        </div>
      </div>

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
            setSpeaker(null);
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
        <div className="flex shrink-0 overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-600" role="group" aria-label={t("rateLabel")}>
          {PLAY_RATES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={rate === r}
              onClick={() => setRate(r)}
              className={`px-1.5 py-1 font-mono text-xs font-semibold transition ${rate === r ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
            >
              {`${f(r)}×`}
            </button>
          ))}
        </div>
      </div>
      <label className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="shrink-0">{t("pace", { wpm: f(pace) })}</span>
        <input type="range" min={MIN_PACE} max={MAX_PACE} step={5} value={pace} onChange={(e) => changePace(Number(e.target.value))} className="w-full accent-blue-600" aria-label={t("paceLabel")} />
      </label>
      <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{t("hint")}</p>
    </div>
  );

  return (
    <SwIndicatorCard
      phoneRole="extra"
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("position"), value: clock(at), note: t("positionNote", { wpm: f(pace) }) },
        { label: t("word"), value: `${f(focusIdx + 1)} / ${f(words)}`, note: `${clock(at)} × ${f(pace)} ÷ ${f(60)}` },
        { label: t("sentence"), value: sent ? f(sent.index + 1) : "—" },
        { label: t("paragraph"), value: para ? `¶${f(para.index + 1)}` : "—" },
        { label: t("remaining"), value: clock(Math.max(0, total - at)) },
        { label: t("progress"), value: pct(total > 0 ? at / total : 0), emphasize: true },
      ]}
    />
  );
}
