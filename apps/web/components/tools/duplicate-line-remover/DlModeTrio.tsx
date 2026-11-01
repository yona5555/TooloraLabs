"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import DlIndicatorCard, { DlIndicatorUnavailable } from "./DlIndicatorCard";
import { useDlLive, useDlModel } from "./DlLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";
import { wrapLabel } from "@/components/tool-ui/labelLayout";

const W = 340;
const H = 200;
const BASE = H - 44;
const TOP = 24;

/**
 * Type #12 (Sensitivity Trio): unique lines under three comparison rules — exact, ignoring case, and
 * ignoring case and surrounding spaces — each counted by the tool. Click a bar to switch to that rule.
 */
export default function DlModeTrio() {
  const t = useTranslations("tools.duplicate-line-remover.education.lab.modes");
  const { setDim } = useDlLive();
  const { draft, a, out, f } = useDlModel();
  if (!a || !out) return <DlIndicatorUnavailable title={t("title")} />;

  const modes = [
    { key: "strict", v: a.modes.strict, cs: true, trim: false },
    { key: "ignoreCase", v: a.modes.ignoreCase, cs: false, trim: false },
    { key: "ignoreCaseAndSpace", v: a.modes.ignoreCaseAndSpace, cs: false, trim: true },
  ];
  const peak = Math.max(...modes.map((m) => m.v), 1);
  const slot = W / 3;

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {modes.map((m, i) => {
        const h = Math.max(3, (m.v / peak) * (BASE - TOP));
        const cx = i * slot + slot / 2;
        const active = draft.caseSensitive === m.cs && draft.trimWhitespace === m.trim;
        return (
          <g
            key={m.key}
            className="cursor-pointer"
            onClick={() => {
              setDim("caseSensitive", m.cs);
              setDim("trimWhitespace", m.trim);
            }}
          >
            <rect x={cx - 30} y={BASE - h} width={60} height={h} rx={5} className={active ? "fill-blue-600 dark:fill-blue-400" : "fill-blue-300 hover:fill-blue-400 dark:fill-blue-800"} />
            <text style={{ fontSize: svgPx(13) }} x={cx} y={BASE - h - 6} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(m.v)}
            </text>
            {/* a rule name wider than its column ("Ignore case + spaces") breaks onto a second line (§39);
                widths allow for the up-to-1.15× a phone draws them at */}
            {wrapLabel(t(m.key), (slot - 8) / 1.15).map((line, j) => (
              <text key={j} style={{ fontSize: svgPx(12) }} x={cx} y={BASE + 18 + j * 15} textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-300">
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </FitSvg>
  );

  return (
    <DlIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("strict"), value: f(a.modes.strict) },
        { label: t("ignoreCase"), value: f(a.modes.ignoreCase) },
        { label: t("ignoreCaseAndSpace"), value: f(a.modes.ignoreCaseAndSpace) },
        { label: t("hidden"), value: f(a.modes.strict - a.modes.ignoreCaseAndSpace) },
        { label: t("current"), value: f(out.uniqueLines), emphasize: true },
      ]}
    />
  );
}
