"use client";
import { useTranslations } from "next-intl";
import WcIndicatorCard from "./WcIndicatorCard";
import { useWcLive } from "./WcLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 330;
// room under the strip for the 12px limit numbers and their descent
const H = 45;
const STRIP_Y = 16;
const STRIP_H = 12;

// GSM 03.38 basic alphabet; any other character forces UCS-2 encoding (70 characters per SMS).
const GSM = /^[A-Za-z0-9 \r\n@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\\[~\]|€]*$/;

type Tone = "ok" | "warn" | "over";
type Zone = { to: number; tone: Tone };
const ZONE_FILL: Record<Tone, string> = {
  ok: "fill-emerald-300 dark:fill-emerald-500/40",
  warn: "fill-amber-200 dark:fill-amber-500/35",
  over: "fill-rose-300 dark:fill-rose-500/40",
};
const TONE_TEXT: Record<Tone, string> = {
  ok: "text-emerald-700 dark:text-emerald-300",
  warn: "text-amber-700 dark:text-amber-300",
  over: "text-rose-700 dark:text-rose-300",
};

function Strip({ zones, max, value, ticks, f }: { zones: Zone[]; max: number; value: number; ticks: number[]; f: (v: number) => string }) {
  const sx = (v: number) => 4 + (Math.min(v, max) / max) * (W - 8);
  const x = sx(value);
  return (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden className="block max-w-full">
      {zones.map((z, i) => {
        const x0 = sx(i ? zones[i - 1].to : 0);
        return <rect key={i} x={x0} y={STRIP_Y} width={Math.max(0, sx(z.to) - x0)} height={STRIP_H} className={ZONE_FILL[z.tone]} />;
      })}
      {ticks.map((v) => (
        <g key={v}>
          <line x1={sx(v)} y1={STRIP_Y} x2={sx(v)} y2={STRIP_Y + STRIP_H + 3} className="stroke-zinc-500 dark:stroke-zinc-400" />
          <text style={{ fontSize: svgPx(12) }} x={sx(v)} y={STRIP_Y + STRIP_H + 12} textAnchor="middle" fontFamily="var(--font-mono)" className="fill-zinc-500 dark:fill-zinc-400">{f(v)}</text>
        </g>
      ))}
      <g style={{ transform: `translateX(${x}px)`, transition: "transform 250ms ease" }}>
        <path d={`M-5 2 L5 2 L0 ${STRIP_Y - 1} Z`} className="fill-blue-700 dark:fill-blue-400" />
        <line x1={0} y1={STRIP_Y - 1} x2={0} y2={STRIP_Y + STRIP_H} strokeWidth={2} className="stroke-blue-700 dark:stroke-blue-400" />
      </g>
      {value > max && <text style={{ fontSize: svgPx(12) }} x={W - 2} y={10} textAnchor="end" fontWeight={700} className="fill-rose-600 dark:fill-rose-400">»</text>}
    </svg>
  );
}

/** Zone Strip (§31 #19): the live character count against four real platform limits, each coloured ok / near / over. */
export default function WcPlatformZones() {
  const t = useTranslations("tools.word-counter.live.platforms");
  const { stats, text, f } = useWcLive();
  const n = stats.characters;
  const gsm = GSM.test(text);
  const single = gsm ? 160 : 70;
  const multi = gsm ? 153 : 67;
  const segments = n === 0 ? 0 : n <= single ? 1 : Math.ceil(n / multi);
  const tone = (zones: Zone[]): Tone => (zones.find((z) => n <= z.to) ?? zones[zones.length - 1]).tone;

  const platforms = [
    { key: "x", limit: 280, zones: [{ to: 252, tone: "ok" }, { to: 280, tone: "warn" }, { to: 350, tone: "over" }] as Zone[], max: 350, ticks: [0, 280] },
    { key: "sms", limit: single, zones: [{ to: single, tone: "ok" }, { to: multi * 2, tone: "warn" }, { to: multi * 3.2, tone: "over" }] as Zone[], max: multi * 3.2, ticks: [0, single, multi * 2, multi * 3] },
    { key: "meta", limit: 160, zones: [{ to: 119, tone: "warn" }, { to: 160, tone: "ok" }, { to: 200, tone: "over" }] as Zone[], max: 200, ticks: [0, 120, 160] },
    { key: "titleTag", limit: 60, zones: [{ to: 49, tone: "warn" }, { to: 60, tone: "ok" }, { to: 75, tone: "over" }] as Zone[], max: 75, ticks: [0, 50, 60] },
  ];

  const indicator = (
    <div className="space-y-2">
      {platforms.map((p) => {
        const tn = tone(p.zones);
        const left = p.limit - n;
        return (
          <div key={p.key}>
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">{t(`${p.key}.name`)}</span>
              <span className={`font-semibold ${TONE_TEXT[tn]}`}>
                {p.key === "sms" ? t("smsStatus", { segments: f(segments) }) : left >= 0 ? t("left", { n: f(left) }) : t("over", { n: f(-left) })}
              </span>
            </div>
            <Strip zones={p.zones} max={p.max} value={n} ticks={p.ticks} f={f} />
          </div>
        );
      })}
    </div>
  );

  return (
    <WcIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("characters"), value: f(n) },
        { label: t("x.name"), value: `${f(n)} / ${f(280)}`, note: t("x.rule") },
        { label: t("sms.name"), value: `${f(segments)} × ${f(segments > 1 ? multi : single)}`, note: gsm ? t("sms.gsm") : t("sms.unicode") },
        { label: t("meta.name"), value: `${f(n)} / ${f(160)}`, note: t("meta.rule") },
        { label: t("titleTag.name"), value: `${f(n)} / ${f(60)}`, note: t("titleTag.rule"), emphasize: true },
      ]}
    />
  );
}
