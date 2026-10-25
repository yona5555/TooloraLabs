"use client";
import { useState, useId } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, KitTrack, useMeasuredSize, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { Drawing, INK, lit, MUTED, px2, SvgLabel as T, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { DualRingGauge } from "@/components/tool-ui/indicator-kit/DualRingGauge";
import type { IssueType } from "./types";
import { A_EXCEPTIONS, align, AN_EXCEPTIONS, ARTICLE_PHRASES, check, CLEAN, INJECT, ISSUE_TYPES, MESSY, MESSY_B, RULES, ruleOf, sentencesOf, SPELL_LIST, suggestionFor, TYPE_COLOR, type Op } from "./sgMath";
import { svgPx } from "@/components/tool-ui/svgPx";

/**
 * The seven 2D spelling & grammar indicator cards (the 3D word ribbon lives in SGCard3D). Each card
 * owns its state (seeded once, never linked to the Results card or to another card) and runs the
 * tool's own SpellingGrammarCalculator on stored example text.
 */
type Side = "visual-left" | "table-left";

function useCardText(key: string) {
  return { t: useTranslations(`tools.spelling-grammar-checker.visuals.${key}`), tc: useTranslations("toolPage.indicatorKit") };
}

const OP_COLOR: Record<Op["op"], string> = { match: "var(--ph-surface)", sub: "var(--ai-b)", ins: "var(--ai-c)", del: "var(--ai-d)", swap: "var(--ai-e)" };
const ALIGNED = SPELL_LIST.map((w) => {
  const s = suggestionFor(w);
  return { w, s, ...align(w, s) };
});

// ── 1. A misspelling against the tool's suggestion, letter by letter ─────────────────
export function SGLettersCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("letters");
  const s = useStepper(1, { min: 0, max: SPELL_LIST.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 230;
  const X0 = 24;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * (SPELL_LIST.length - 1));
  const { W, H } = d;
  const cur = ALIGNED[s.value];
  // A swap fills two columns; every other step one.
  const cols = cur.ops.reduce((a, o) => a + (o.op === "swap" ? 2 : 1), 0);
  const cw = Math.min(46, (W - 2 * X0) / cols);
  const x0 = (W - cw * cols) / 2;
  const r = Math.min(17, cw * 0.4);
  const yTop = 54;
  const yBot = 128;
  const trackY = H - 24;
  const kinds = [...new Set(cur.ops.filter((o) => o.op !== "match").map((o) => t(`op.${o.op}`)))];
  const valueText = `${cur.w} → ${cur.s}`;
  const rows: KitRow[] = [
    { key: "typed", label: t("rowTyped"), value: cur.w },
    { key: "suggest", label: t("rowSuggest"), value: cur.s },
    { key: "dist", label: t("rowDist"), value: String(cur.dist), isKey: true },
    { key: "kinds", label: t("rowKinds"), value: kinds.join(", ") },
    { key: "len", label: t("rowLen"), value: `${cur.w.length} → ${cur.s.length}` },
  ];
  let col = 0;
  return (
    <IndicatorCard
      idPrefix="sg"
      n={1}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { w: ltr(cur.w), s: ltr(cur.s), d: ltr(String(cur.dist)) })}
      controls={<KitControls s={s} valueText={cur.w} testId="sg-c1" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + (s.value / (SPELL_LIST.length - 1)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="sg-c1">
          <T x={X0} y={20} text={t("typed")} anchor="start" size={12} bold style={{ fill: "var(--ai-d)" }} />
          <T x={X0} y={yBot + 40} text={t("suggested")} anchor="start" size={12} bold style={{ fill: "var(--ai-c)" }} />
          {cur.ops.map((o, i) => {
            const n = o.op === "swap" ? 2 : 1;
            const cx0 = x0 + cw * (col + 0.5);
            col += n;
            const edit = o.op !== "match";
            const g = (a: string, b: string, k: number) => {
              const cx = cx0 + cw * k;
              return (
                <g key={k}>
                  {o.op !== "ins" && <circle cx={cx} cy={yTop} r={r} style={{ fill: edit ? OP_COLOR[o.op] : "var(--ph-surface)", ...lit(edit && hover === "kinds") }} />}
                  {o.op === "ins" && <circle cx={cx} cy={yTop} r={r} fill="none" style={{ stroke: "var(--ai-c)" }} strokeDasharray="3 3" />}
                  {a && <T x={cx} y={yTop + 5} text={a} size={14} bold style={edit ? { fill: "var(--ph-surface)" } : INK} />}
                  {o.op !== "del" && <circle cx={cx} cy={yBot} r={r} style={{ fill: edit ? OP_COLOR[o.op] : "var(--ph-surface)", stroke: "var(--ph-line)" }} />}
                  {o.op === "del" && <circle cx={cx} cy={yBot} r={r} fill="none" style={{ stroke: "var(--ai-d)" }} strokeDasharray="3 3" />}
                  {b && <T x={cx} y={yBot + 5} text={b} size={14} bold style={edit ? { fill: "var(--ph-surface)" } : INK} />}
                </g>
              );
            };
            return (
              <g key={i} onPointerEnter={() => edit && setHover("kinds")} onPointerLeave={() => setHover(null)}>
                {o.op === "swap" ? (
                  <>
                    <line x1={cx0} y1={yTop + r} x2={cx0 + cw} y2={yBot - r} style={{ stroke: "var(--ai-e)" }} strokeWidth={2} />
                    <line x1={cx0 + cw} y1={yTop + r} x2={cx0} y2={yBot - r} style={{ stroke: "var(--ai-e)" }} strokeWidth={2} />
                    {g(o.a[0], o.b[0], 0)}
                    {g(o.a[1], o.b[1], 1)}
                  </>
                ) : (
                  <>
                    {o.op !== "ins" && o.op !== "del" && <line x1={cx0} y1={yTop + r} x2={cx0} y2={yBot - r} style={{ stroke: edit ? OP_COLOR[o.op] : "var(--ph-grid)" }} strokeWidth={edit ? 2 : 1.25} />}
                    {g(o.a, o.b, 0)}
                  </>
                )}
              </g>
            );
          })}
          <line x1={X0} y1={trackY} x2={W - X0} y2={trackY} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <line x1={X0} y1={trackY} x2={X0 + (s.value / (SPELL_LIST.length - 1)) * (W - 2 * X0)} y2={trackY} style={{ stroke: "var(--ai-a)" }} strokeWidth={8} strokeLinecap="round" />
        </Drawing>
      }
    />
  );
}

// ── 2. Kinds of slip across the misspelling list (ranked bars) ───────────────────────
const KINDS = (["ins", "swap", "sub", "del"] as const)
  .map((k) => ({ k, n: ALIGNED.reduce((a, x) => a + x.ops.filter((o) => o.op === k).length, 0), words: ALIGNED.filter((x) => x.ops.some((o) => o.op === k)).map((x) => x.w) }))
  .sort((a, b) => b.n - a.n);
const KIND_TOTAL = KINDS.reduce((a, k) => a + k.n, 0);
export function SGSlipsCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("slips");
  const s = useStepper(0, { min: 0, max: KINDS.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 240;
  const X0 = 120;
  const top = 18;
  const d = useDrawing(HMIN, s, (_x, y, _W, H) => ((y - top) / (H - top - 12)) * KINDS.length - 0.5);
  const { W, H } = d;
  const rowH = (H - top - 12) / KINDS.length;
  const maxN = Math.max(...KINDS.map((k) => k.n));
  const xl = (v: number) => X0 + (v / maxN) * (W - X0 - 70);
  const cur = KINDS[s.value];
  const valueText = `${t(`op.${cur.k}`)}: ${cur.n}`;
  const rows: KitRow[] = [
    { key: "kind", label: t("rowKind"), value: t(`op.${cur.k}`) },
    { key: "n", label: t("rowCount"), value: String(cur.n), isKey: true },
    { key: "share", label: t("rowShare"), value: `${Math.round((cur.n / KIND_TOTAL) * 100)} %` },
    { key: "words", label: t("rowWords"), value: cur.words.slice(0, 3).join(", ") + (cur.words.length > 3 ? " …" : "") },
    { key: "list", label: t("rowList"), value: String(SPELL_LIST.length) },
  ];
  return (
    <IndicatorCard
      idPrefix="sg"
      n={2}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { k: t(`op.${cur.k}`), n: ltr(String(cur.n)), t: ltr(String(KIND_TOTAL)) })}
      controls={<KitControls s={s} valueText={t(`op.${cur.k}`)} testId="sg-c2" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xl(cur.n) + 30, y: top + rowH * (s.value + 0.5), dir: "vertical" }} s={s} testId="sg-c2">
          {KINDS.map((k, i) => {
            const y = top + rowH * (i + 0.5);
            const on = i === s.value;
            const bh = Math.min(30, rowH * 0.55);
            return (
              <g key={k.k} onPointerEnter={() => setHover("n")} onPointerLeave={() => setHover(null)}>
                <T x={X0 - 10} y={y + 4} text={t(`op.${k.k}`)} anchor="end" size={12} bold style={on ? INK : MUTED} />
                <rect x={X0} y={y - bh / 2} width={Math.max(bh, xl(k.n) - X0)} height={bh} rx={bh / 2} style={{ fill: OP_COLOR[k.k], opacity: on ? 1 : 0.5, ...lit(on && hover === "n") }} />
                <T x={xl(k.n) - 10} y={y + 4} text={String(k.n)} anchor="end" size={12} bold style={{ fill: "var(--ph-surface)" }} />
              </g>
            );
          })}
        </Drawing>
      }
    />
  );
}

// ── 3. The a / an rule as a decision path (flow) ─────────────────────────────────────
export function SGArticleCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("article");
  const s = useStepper(0, { min: 0, max: ARTICLE_PHRASES.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 290;
  const X0 = 20;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * (ARTICLE_PHRASES.length - 1));
  const { W, H } = d;
  const phrase = ARTICLE_PHRASES[s.value];
  const [art, word] = phrase.split(" ");
  const vowel = /^[aeiou]/i.test(word);
  const exception = art === "a" ? A_EXCEPTIONS.has(word) : AN_EXCEPTIONS.has(word);
  // The tool tests "a" + vowel letter and "an" + consonant letter; anything else is never looked at.
  const tested = art === "a" ? vowel : !vowel;
  const flagged = check(phrase).issues.filter((i) => ruleOf(i) === "article");
  const nodes = [
    { key: "phrase", label: phrase, sub: t("nodePhrase") },
    { key: "letter", label: vowel ? t("vowel") : t("consonant"), sub: t("nodeLetter", { l: word[0] }) },
    { key: "exception", label: tested ? (exception ? t("yes") : t("no")) : "—", sub: t("nodeException") },
    { key: "verdict", label: flagged.length ? t("flag", { s: flagged[0].suggestion ?? "" }) : t("ok"), sub: t("nodeVerdict") },
  ];
  const nw = (W - 2 * X0 - 3 * 22) / 4;
  const narrow = nw < 100;
  const ny = H / 2 - 40;
  const trackY = H - 22;
  const rows: KitRow[] = [
    { key: "phrase", label: t("rowPhrase"), value: phrase },
    { key: "letter", label: t("rowLetter"), value: `${word[0]} (${vowel ? t("vowel") : t("consonant")})` },
    { key: "exception", label: t("rowException"), value: tested ? (exception ? t("yes") : t("no")) : t("notTested") },
    { key: "verdict", label: t("rowVerdict"), value: flagged.length ? t("flag", { s: flagged[0].suggestion ?? "" }) : t("ok"), isKey: true },
  ];
  return (
    <IndicatorCard
      idPrefix="sg"
      n={3}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t(flagged.length ? "caption.flag" : tested ? "caption.exception" : "caption.untested", { p: ltr(phrase) })}
      controls={<KitControls s={s} valueText={phrase} testId="sg-c3" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={phrase} handle={{ x: X0 + (s.value / (ARTICLE_PHRASES.length - 1)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="sg-c3">
          {nodes.map((n, i) => {
            const last = i === nodes.length - 1;
            const dim = i === 2 && !tested;
            const fill = last ? (flagged.length ? "var(--ai-d)" : "var(--ai-c)") : dim ? "var(--glass-track)" : "var(--ai-a)";
            // Wide: four pills in a row. Narrow (phone): the same pills stacked, the step name beside each.
            const x = narrow ? X0 + 96 : X0 + i * (nw + 22);
            const y = narrow ? 10 + i * 58 : ny;
            const w = narrow ? W - 2 * X0 - 96 : nw;
            const h = narrow ? 40 : 52;
            return (
              <g key={n.key} onPointerEnter={() => setHover(n.key)} onPointerLeave={() => setHover(null)}>
                {i > 0 && !narrow && <path d={`M ${x - 20} ${ny + 26} L ${x - 4} ${ny + 26} M ${x - 9} ${ny + 21} L ${x - 4} ${ny + 26} L ${x - 9} ${ny + 31}`} fill="none" style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={2} />}
                {i > 0 && narrow && <path d={`M ${x + w / 2} ${y - 17} L ${x + w / 2} ${y - 3} M ${x + w / 2 - 5} ${y - 8} L ${x + w / 2} ${y - 3} L ${x + w / 2 + 5} ${y - 8}`} fill="none" style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={2} />}
                <rect x={x} y={y} width={w} height={h} rx={h / 2} style={{ fill, ...lit(hover === n.key) }} />
                <T x={x + w / 2} y={y + h / 2 + 5} text={n.label} size={13} bold style={{ fill: dim ? "var(--ph-ink-muted)" : "var(--ph-surface)" }} />
                {narrow ? <T x={X0} y={y + h / 2 + 4} text={n.sub} anchor="start" size={12} /> : <T x={x + nw / 2} y={ny + 74} text={n.sub} size={12} />}
              </g>
            );
          })}
          <line x1={X0} y1={trackY} x2={W - X0} y2={trackY} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          {ARTICLE_PHRASES.map((p, i) => (
            <circle key={p} cx={X0 + (i / (ARTICLE_PHRASES.length - 1)) * (W - 2 * X0)} cy={trackY} r={3} style={{ fill: "var(--ph-ink-muted)" }} />
          ))}
        </Drawing>
      }
    />
  );
}

// ── 4. Issues per 100 words (double-ring gauge) ──────────────────────────────────────
const CLEAN_WORDS = CLEAN.split(/\s+/).length;
export function SGDensityCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("density");
  const s = useStepper(3, { min: 0, max: INJECT.length, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const text = INJECT.slice(0, s.value).reduce((acc, [a, b]) => acc.replace(a, b), CLEAN);
  const out = check(text);
  const per100 = (out.issues.length / out.wordCount) * 100;
  const valueText = t("valueText", { n: out.issues.length, p: per100.toFixed(1) });
  const rows: KitRow[] = [
    { key: "inj", label: t("rowInjected"), value: String(s.value) },
    { key: "words", label: t("rowWords"), value: String(out.wordCount) },
    { key: "issues", label: t("rowIssues"), value: String(out.issues.length), isKey: true },
    { key: "per100", label: t("rowPer100"), value: per100.toFixed(1) },
    { key: "clean", label: t("rowClean"), value: String(out.wordCount - out.issues.length) },
  ];
  return (
    <IndicatorCard
      idPrefix="sg"
      n={4}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { n: ltr(String(out.issues.length)), w: ltr(String(CLEAN_WORDS)), p: ltr(per100.toFixed(1)) })}
      controls={<KitControls s={s} valueText={t("valueShort", { n: s.value })} testId="sg-c4" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <DualRingGauge
          s={s}
          frac={s.value / INJECT.length}
          innerFrac={per100 / 25}
          fromFrac={(f) => f * INJECT.length}
          outer={{ ticks: Array.from({ length: INJECT.length - 1 }, (_, i) => (i + 1) / INJECT.length), color: "var(--ai-d)", tickColor: "var(--ph-ink)", hoverKey: "issues" }}
          inner={{ ticks: [0.2, 0.4, 0.6, 0.8], color: "var(--ai-b)", tickColor: "var(--ph-ink-muted)", hoverKey: "per100" }}
          center={[String(out.issues.length), t("outerUnit"), t("innerUnit", { p: per100.toFixed(1) })]}
          hover={hover}
          onHover={setHover}
          label={t("handle")}
          valueText={valueText}
          testId="sg-c4"
          hMin={280}
        />
      }
    />
  );
}

// ── 5. Issues by type (donut) ────────────────────────────────────────────────────────
const MESSY_SENTENCES = sentencesOf(MESSY);
export function SGTypesCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("types");
  const tl = useTranslations("tools.spelling-grammar-checker.quickReference.legend");
  const s = useStepper(3, { min: 1, max: MESSY_SENTENCES.length, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 480, h: 250 });
  const text = MESSY_SENTENCES.slice(0, s.value).join("").trimEnd();
  const out = check(text);
  const parts = ISSUE_TYPES.map((ty) => ({ key: ty, v: out.issues.filter((i) => i.type === ty).length, color: TYPE_COLOR[ty] }));
  const total = out.issues.length || 1;
  const cx = Math.min(W * 0.3, H / 2 + 20);
  const cy = H / 2;
  const R = Math.min(H / 2 - 12, W * 0.25);
  const r0 = R * 0.58;
  const arcs = parts.map((p, i) => {
    const before = parts.slice(0, i).reduce((a, q) => a + q.v, 0);
    const a0 = (before / total) * 2 * Math.PI;
    const a1 = ((before + p.v) / total) * 2 * Math.PI;
    const big = a1 - a0 > Math.PI ? 1 : 0;
    const P = (a: number, rr: number) => `${px2(cx + rr * Math.sin(a))} ${px2(cy - rr * Math.cos(a))}`;
    const full = p.v === out.issues.length && p.v > 0;
    return { ...p, full, d: p.v === 0 || full ? "" : `M ${P(a0, R)} A ${R} ${R} 0 ${big} 1 ${P(a1, R)} L ${P(a1, r0)} A ${r0} ${r0} 0 ${big} 0 ${P(a0, r0)} Z` };
  });
  const lx = cx + R + 28;
  const top = parts.reduce((a, p) => (p.v > a.v ? p : a), parts[0]);
  const valueText = t("valueText", { k: s.value, n: out.issues.length });
  const rows: KitRow[] = [
    { key: "k", label: t("rowSentences"), value: String(s.value) },
    ...parts.map((p) => ({ key: p.key, label: tl(p.key), value: String(p.v) })),
    { key: "total", label: t("rowTotal"), value: String(out.issues.length), isKey: true },
  ];
  return (
    <IndicatorCard
      idPrefix="sg"
      n={5}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { n: ltr(String(out.issues.length)), top: tl(top.key) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="sg-c5-handle" ticks={MESSY_SENTENCES.map((_, i) => ({ at: i + 1, text: String(i + 1) }))} />
          <KitControls s={s} valueText={t("valueShort", { k: s.value })} testId="sg-c5" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <div ref={box} className="relative min-h-[250px] w-full flex-1">
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
            {arcs.map((a) =>
              a.full ? (
                <circle key={a.key} cx={cx} cy={cy} r={(R + r0) / 2} fill="none" style={{ stroke: a.color }} strokeWidth={R - r0} />
              ) : a.d ? (
                <path key={a.key} d={a.d} style={{ fill: a.color, ...lit(hover === a.key) }} onPointerEnter={() => setHover(a.key)} onPointerLeave={() => setHover(null)} />
              ) : null,
            )}
            <T x={cx} y={cy - 2} text={String(out.issues.length)} size={20} bold style={INK} />
            <T x={cx} y={cy + 16} text={t("centre")} size={12} />
            {parts.map((p, i) => {
              const y = cy - 54 + i * 36;
              return (
                <g key={p.key} onPointerEnter={() => setHover(p.key)} onPointerLeave={() => setHover(null)}>
                  <circle cx={lx} cy={y} r={7} style={{ fill: p.color }} />
                  <T x={lx + 14} y={y - 2} text={tl(p.key)} anchor="start" size={12} bold style={INK} />
                  <T x={lx + 14} y={y + 13} text={`${p.v} · ${((p.v / total) * 100).toFixed(0)} %`} anchor="start" size={12} />
                </g>
              );
            })}
          </svg>
        </div>
      }
    />
  );
}

// ── 7. Matches per check (lollipops) ─────────────────────────────────────────────────
const B_SENTENCES = sentencesOf(MESSY_B);
export function SGRulesCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("rules");
  const s = useStepper(2, { min: 1, max: B_SENTENCES.length, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const X0 = 44;
  const k = s.value;
  const d = useDrawing(HMIN, s, (x, _y, W) => 0.5 + ((x - X0) / (W - 2 * X0)) * B_SENTENCES.length);
  const { W, H } = d;
  const text = B_SENTENCES.slice(0, k).join("").trimEnd();
  const out = check(text);
  const counts = RULES.map((r) => out.issues.filter((i) => ruleOf(i) === r).length);
  const full = check(MESSY_B);
  const maxC = Math.max(1, ...RULES.map((r) => full.issues.filter((i) => ruleOf(i) === r).length));
  const cw = (W - 2 * X0) / RULES.length;
  const xc = (i: number) => X0 + cw * (i + 0.5);
  const base = H - 92;
  const yc = (v: number) => base - (v / maxC) * (base - 30);
  const trackY = H - 22;
  const busiest = RULES[counts.indexOf(Math.max(...counts))];
  const valueText = t("valueText", { k, n: out.issues.length });
  const rows: KitRow[] = [
    { key: "k", label: t("rowSentences"), value: String(k) },
    { key: "fired", label: t("rowFired"), value: `${counts.filter((c) => c > 0).length} / ${RULES.length}` },
    { key: "busiest", label: t("rowBusiest"), value: t(`rule.${busiest}`) },
    { key: "total", label: t("rowTotal"), value: String(out.issues.length), isKey: true },
  ];
  return (
    <IndicatorCard
      idPrefix="sg"
      n={7}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { k: ltr(String(k)), f: ltr(String(counts.filter((c) => c > 0).length)), n: ltr(String(out.issues.length)) })}
      controls={<KitControls s={s} valueText={t("valueShort", { k })} testId="sg-c7" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((k - 0.5) / B_SENTENCES.length) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="sg-c7">
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={{ stroke: "var(--ph-line)" }} strokeWidth={1.25} />
          {RULES.map((r, i) => {
            const c = counts[i];
            const on = c > 0;
            const ty: IssueType = r === "misspelling" ? "spelling" : r === "pronounI" || r === "sentenceStart" ? "capitalization" : r === "spaces" || r === "spaceAfter" ? "punctuation" : "grammar";
            return (
              <g key={r} onPointerEnter={() => setHover(on ? "fired" : null)} onPointerLeave={() => setHover(null)}>
                <line x1={xc(i)} y1={base} x2={xc(i)} y2={yc(c)} style={{ stroke: on ? TYPE_COLOR[ty] : "var(--ph-grid)" }} strokeWidth={3} />
                <circle cx={xc(i)} cy={yc(c)} r={on ? 12 : 6} style={{ fill: on ? TYPE_COLOR[ty] : "var(--ph-surface)", ...lit(on && hover === "fired") }} />
                {on && <T x={xc(i)} y={yc(c) + 4} text={String(c)} size={12} bold style={{ fill: "var(--ph-surface)" }} />}
                <g transform={`translate(${px2(xc(i) + 4)} ${base + 14}) rotate(${cw < 60 ? -70 : -35})`}>
                  <text x={0} y={0} fontWeight={600} textAnchor="end" style={{ fontSize: svgPx(cw < 60 ? 12 : 12), fill: on ? "var(--ph-ink)" : "var(--ph-ink-muted)" }}>
                    {t(`rule.${r}`)}
                  </text>
                </g>
              </g>
            );
          })}
          <line x1={X0} y1={trackY} x2={W - X0} y2={trackY} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <line x1={X0} y1={trackY} x2={X0 + ((k - 0.5) / B_SENTENCES.length) * (W - 2 * X0)} y2={trackY} style={{ stroke: "var(--ai-a)" }} strokeWidth={8} strokeLinecap="round" />
        </Drawing>
      }
    />
  );
}

// ── 8. Issues found as the checker scans left to right (cumulative step area) ───────
const MESSY_ISSUES = check(MESSY).issues;
export function SGScanCard({ side }: { side: Side }) {
  const svgId = useId();
  const { t, tc } = useCardText("scan");
  const tl = useTranslations("tools.spelling-grammar-checker.quickReference.legend");
  const s = useStepper(90, { min: 0, max: MESSY.length, step: 5 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 240;
  const X0 = 36;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - X0 - 16)) * MESSY.length);
  const { W, H } = d;
  const p = s.value;
  const xc = (c: number) => X0 + (c / MESSY.length) * (W - X0 - 16);
  const top = 20;
  const bot = H - 50;
  const total = MESSY_ISSUES.length;
  const yc = (v: number) => bot - (v / total) * (bot - top);
  const found = MESSY_ISSUES.filter((i) => i.start < p);
  const next = MESSY_ISSUES.find((i) => i.start >= p);
  const pts: string[] = [`M ${X0} ${bot}`];
  MESSY_ISSUES.forEach((i, k) => {
    pts.push(`L ${px2(xc(i.start))} ${px2(yc(k))}`, `L ${px2(xc(i.start))} ${px2(yc(k + 1))}`);
  });
  pts.push(`L ${px2(xc(MESSY.length))} ${px2(yc(total))}`);
  const steps = pts.join(" ");
  const valueText = t("valueText", { p, n: found.length });
  const rows: KitRow[] = [
    { key: "p", label: t("rowPos"), value: `${p} / ${MESSY.length}` },
    { key: "share", label: t("rowShare"), value: `${Math.round((p / MESSY.length) * 100)} %` },
    { key: "found", label: t("rowFound"), value: `${found.length} / ${total}`, isKey: true },
    { key: "last", label: t("rowLast"), value: found.length ? tl(found[found.length - 1].type) : "—" },
    { key: "next", label: t("rowNext"), value: next ? String(next.start) : "—" },
  ];
  return (
    <IndicatorCard
      idPrefix="sg"
      n={8}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { p: ltr(String(p)), n: ltr(String(found.length)), t: ltr(String(total)) })}
      controls={<KitControls s={s} valueText={t("valueShort", { p })} testId="sg-c8" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xc(p), y: H - 22, dir: "horizontal" }} s={s} testId="sg-c8">
          <defs>
            <clipPath id={`${svgId}sg-c8-clip`}>
              <rect x={X0} y={0} width={Math.max(0, xc(p) - X0)} height={H} />
            </clipPath>
          </defs>
          {[0, Math.round(total / 2), total].map((v) => (
            <g key={v}>
              <line x1={X0} y1={yc(v)} x2={W - 16} y2={yc(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={X0 - 6} y={yc(v) + 4} text={String(v)} anchor="end" size={12} />
            </g>
          ))}
          <path d={`${steps} L ${px2(xc(MESSY.length))} ${bot} Z`} style={{ fill: "var(--glass-track)" }} />
          <path d={`${steps} L ${px2(xc(MESSY.length))} ${bot} Z`} clipPath={`url(#${svgId}sg-c8-clip)`} style={{ fill: "var(--ai-soft)" }} />
          <path d={steps} fill="none" clipPath={`url(#${svgId}sg-c8-clip)`} style={{ stroke: "var(--ai-a)" }} strokeWidth={2.5} />
          {MESSY_ISSUES.map((i, k) => (
            <circle key={k} cx={xc(i.start)} cy={bot + 10} r={4} style={{ fill: TYPE_COLOR[i.type], opacity: i.start < p ? 1 : 0.35, ...lit(i.start < p && hover === "found") }} />
          ))}
          <line x1={xc(p)} y1={top} x2={xc(p)} y2={bot} style={{ stroke: "var(--ai-d)" }} strokeWidth={2} />
          <T x={Math.min(xc(p) + 8, W - 60)} y={yc(found.length) - 8} text={String(found.length)} anchor="start" size={12} bold style={INK} />
          <line x1={X0} y1={H - 22} x2={W - 16} y2={H - 22} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <line x1={X0} y1={H - 22} x2={xc(p)} y2={H - 22} style={{ stroke: "var(--ai-a)" }} strokeWidth={8} strokeLinecap="round" />
        </Drawing>
      }
    />
  );
}
