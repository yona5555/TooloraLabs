"use client";
import { useTranslations } from "next-intl";
import {
  checkFields,
  CITATION_STYLES,
  formatInText,
  formatReference,
  segmentsToHtml,
  segmentsToText,
  sourceLang,
  type CitationStyleId,
  type CitePart,
  type CiteSegment,
  type CiteSource,
} from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import { CopyButton, EntryText, fmt } from "./CitationShared";
import { PART_COLORS, type StudioState } from "./studio";

type Props = { state: StudioState; onChange: (next: StudioState) => void; source: CiteSource; index: number };

/** Element parts in the order they first appear in an entry (punctuation dropped). */
export function partOrder(segs: CiteSegment[]): CitePart[] {
  const out: CitePart[] = [];
  segs.forEach((s) => {
    if (s.part !== "punct" && !out.includes(s.part)) out.push(s.part);
  });
  return out;
}

/** Live 2D matrix: the order of elements in each style for this source; click a row to switch style. */
function StyleOrderMatrix({ source, index, style, onPick, names }: { source: CiteSource; index: number; style: CitationStyleId; onPick: (s: CitationStyleId) => void; names: Record<CitationStyleId, string> }) {
  const rows = CITATION_STYLES.map((id) => ({ id, parts: partOrder(formatReference(source, id, index + 1)) }));
  const cols = Math.max(...rows.map((r) => r.parts.length), 1);
  const W = 300;
  const LW = 64;
  const RH = 34;
  const H = rows.length * RH + 8;
  const cw = (W - LW - 4) / cols;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={names[style]} style={{ direction: "ltr" }} className="mx-auto block max-h-[260px]">
      {rows.map((r, ri) => {
        const y = ri * RH + 4;
        const on = r.id === style;
        return (
          <g key={r.id} onClick={() => onPick(r.id)} style={{ cursor: "pointer" }}>
            <rect x={0} y={y} width={W} height={RH - 4} rx={8} className={on ? "fill-blue-100 dark:fill-blue-500/20" : "fill-transparent"} />
            <text x={6} y={y + RH / 2 + 1} fontSize={11} fontWeight={on ? 800 : 600} className={on ? "fill-blue-700 dark:fill-blue-300" : "fill-zinc-600 dark:fill-zinc-300"}>
              {names[r.id]}
            </text>
            {r.parts.map((p, pi) => (
              <g key={p} style={{ transition: "transform 400ms ease", transform: `translate(${LW + pi * cw}px, ${y + 4}px)` }}>
                <rect width={cw - 3} height={RH - 12} rx={5} fill={PART_COLORS[p]} fillOpacity={on ? 0.95 : 0.6} />
                <text x={(cw - 3) / 2} y={(RH - 12) / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="white">
                  {pi + 1}
                </text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export default function CitationStudioResult({ state, onChange, source, index }: Props) {
  const t = useTranslations("tools.citation-generator.studio");
  const style = state.style;
  const rtl = sourceLang(source) === "ar";
  const segs = formatReference(source, style, index + 1);
  const text = segmentsToText(segs);
  const html = segmentsToHtml(segs);
  const paren = formatInText(source, style, { page: state.page, index: index + 1 });
  const narrative = formatInText(source, style, { page: state.page, index: index + 1, narrative: true });
  const names = Object.fromEntries(CITATION_STYLES.map((id) => [id, t(`styles.${id}`)])) as Record<CitationStyleId, string>;
  const checks = checkFields(source);
  const missing = checks.filter((c) => !c.filled);

  const byPart = new Map<CitePart, string>();
  segs.forEach((s) => s.part !== "punct" && byPart.set(s.part, `${byPart.get(s.part) ?? ""}${byPart.has(s.part) ? " · " : ""}${s.text}`));
  const raw: Partial<Record<CitePart, string>> = {
    author: source.authors.map((a) => [a.given, a.family].filter(Boolean).join(" ")).filter(Boolean).join("; "),
    date: [source.year, source.month, source.day].filter(Boolean).join("-"),
    title: source.title,
    container: source.container,
    edition: source.edition,
    publisher: [source.place, source.publisher].filter(Boolean).join(" · "),
    locator: [source.volume, source.issue, source.pages].filter(Boolean).join(" / "),
    identifier: source.doi || source.url,
    access: source.accessed,
    number: String(index + 1),
  };

  const groups: LiveTableGroup[] = [
    {
      title: t("result.groupElements", { style: names[style] }),
      rows: partOrder(segs).map((p, i) => ({ label: `${i + 1}. ${t(`parts.${p}`)}`, formula: raw[p] || "—", value: byPart.get(p) ?? "" })),
    },
    {
      title: t("result.groupInText"),
      rows: [
        { label: t("result.parenthetical"), formula: state.page ? `${t("result.page")} ${state.page}` : "—", value: paren, emphasize: true },
        { label: t("result.narrative"), formula: style === "ieee" ? t("result.ieeeNumber") : t("result.narrativeHint"), value: narrative },
      ],
    },
    {
      title: t("result.groupStyles"),
      rows: CITATION_STYLES.map((id) => {
        const s = segmentsToText(formatReference(source, id, index + 1));
        return { label: names[id], formula: t("result.chars", { n: fmt(s.length) }), value: formatInText(source, id, { page: state.page, index: index + 1 }) };
      }),
    },
    {
      title: t("result.groupChecks"),
      rows: checks.map((c) => ({
        label: t(`fields.${c.field === "container" && source.type === "website" ? "site" : c.field}`),
        formula: t(`result.level.${c.level}`),
        value: c.filled ? t("result.ok") : t("result.missing"),
        emphasize: !c.filled && c.level === "required",
      })),
    },
  ];

  return (
    <SectionCard title={t("result.title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="p-3 lg:flex lg:flex-1 lg:flex-col">
      <div role="tablist" aria-label={t("result.style")} className="mb-2 grid grid-cols-5 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" data-bp-inner>
        {CITATION_STYLES.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={style === id}
            onClick={() => onChange({ ...state, style: id })}
            className={`rounded-md px-1 py-1.5 text-[11px] leading-3 font-bold transition ${
              style === id ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {names[id]}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-blue-50 p-2.5 dark:bg-blue-500/10" data-bp-inner>
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{t("result.reference")}</p>
          <CopyButton text={text} html={html} label={t("result.copy")} doneLabel={t("result.copied")} />
        </div>
        <EntryText segs={segs} rtl={rtl} colored className="font-serif text-[15px] leading-6 text-zinc-900 dark:text-zinc-50" />
      </div>

      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 text-sm">
        {[
          { k: t("result.parenthetical"), v: paren },
          { k: t("result.narrative"), v: narrative },
        ].map((r) => (
          <div key={r.k} className="contents">
            <p className="min-w-0">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{r.k}: </span>
              <bdi className="font-semibold text-blue-700 dark:text-blue-300">{r.v}</bdi>
            </p>
            <CopyButton text={r.v} label={t("result.copy")} doneLabel={t("result.copied")} compact />
          </div>
        ))}
        <label className="col-span-2 flex items-center gap-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          {t("result.page")}
          <input
            value={state.page}
            onChange={(e) => onChange({ ...state, page: e.target.value })}
            dir="ltr"
            inputMode="numeric"
            className="w-20 rounded-md border border-zinc-300 bg-white px-2 py-0.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          {missing.length > 0 && (
            <span className="ms-auto truncate text-amber-700 dark:text-amber-400">{t("result.missingCount", { n: missing.length })}</span>
          )}
        </label>
      </div>

      <div className="mt-3 lg:flex lg:flex-1 lg:flex-col">
        <LiveTableFill>
          <LiveTable3DLayout
            headings={[t("result.colElement"), t("result.colEntered"), t("result.colOutput")]}
            groups={groups}
            drawing={<StyleOrderMatrix source={source} index={index} style={style} onPick={(id) => onChange({ ...state, style: id })} names={names} />}
            caption={
              <span className="flex flex-wrap justify-center gap-x-2 gap-y-0.5">
                <span className="w-full text-center">{t("result.matrixCaption")}</span>
                {partOrder(segs).map((p) => (
                  <span key={p} className="inline-flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: PART_COLORS[p] }} />
                    {t(`parts.${p}`)}
                  </span>
                ))}
              </span>
            }
          />
        </LiveTableFill>
      </div>
    </SectionCard>
  );
}
