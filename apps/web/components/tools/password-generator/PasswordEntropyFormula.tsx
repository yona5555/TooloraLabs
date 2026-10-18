"use client";
import { useTranslations } from "next-intl";
import PasswordIndicatorCard, { PasswordIndicatorUnavailable } from "./PasswordIndicatorCard";
import { pow10Text, usePasswordModel } from "./PasswordLiveContext";

const W = 340;
const H = 200;

/**
 * Type #18 (Formula Diagram): H = n × log₂ N (+ log₂ 100 for an appended number), with every term
 * filled in from the current settings and the keyspace it implies.
 */
export default function PasswordEntropyFormula() {
  const t = useTranslations("tools.password-generator.education.lab.formula");
  const { draft, s, f } = usePasswordModel();
  if (!s.valid) return <PasswordIndicatorUnavailable title={t("title")} />;

  const words = draft.mode === "passphrase";
  const terms = [
    { sym: "n", val: f(s.symbols), label: words ? t("nWords") : t("nChars"), cls: "fill-blue-600 dark:fill-blue-400" },
    { sym: "N", val: f(s.poolSize), label: words ? t("NWords") : t("NChars"), cls: "fill-emerald-600 dark:fill-emerald-400" },
    ...(s.extraBits ? [{ sym: "+", val: "log₂100", label: t("digits"), cls: "fill-amber-500 dark:fill-amber-400" }] : []),
  ];
  const cw = W / terms.length;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <text x={W / 2} y={30} textAnchor="middle" fontSize={22} fontWeight={700} fontFamily="ui-serif, Georgia, serif" className="fill-zinc-800 dark:fill-zinc-100">
        H = n · log₂ N{s.extraBits ? " + log₂ 100" : ""}
      </text>
      {terms.map((tm, i) => {
        const cx = i * cw + cw / 2;
        return (
          <g key={tm.sym}>
            <path d={`M ${cx} 44 V 62`} strokeWidth={1.5} className="stroke-zinc-300 dark:stroke-zinc-600" />
            <circle cx={cx} cy={88} r={24} className={tm.cls} />
            <text x={cx} y={93} textAnchor="middle" fontSize={tm.val.length > 4 ? 11 : 15} fontWeight={700} className="fill-white">
              {tm.val}
            </text>
            <text x={cx} y={128} textAnchor="middle" fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
              {tm.label}
            </text>
          </g>
        );
      })}
      <text x={W / 2} y={160} textAnchor="middle" fontSize={14} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
        {f(s.symbols)} × {f(s.bitsPerSymbol, 3)}
        {s.extraBits ? ` + ${f(s.extraBits, 3)}` : ""} = {f(s.entropyBits, 2)}
      </text>
      <text x={W / 2} y={186} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
        {t("keyspace", { k: pow10Text(s.log10Keyspace) })}
      </text>
    </svg>
  );

  return (
    <PasswordIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: "n", value: f(s.symbols) },
        { label: "N", value: f(s.poolSize) },
        { label: "log₂ N", value: f(s.bitsPerSymbol, 4) },
        { label: t("keyspaceLabel"), value: `N^n = ${pow10Text(s.log10Keyspace)}` },
        { label: "H", value: `${f(s.entropyBits, 2)} ${t("bits")}`, emphasize: true },
      ]}
    />
  );
}
