"use client";
import { useTranslations } from "next-intl";
import LiIndicatorCard from "./LiIndicatorCard";
import { FIT_TARGETS } from "./liMath";
import { useLiLive } from "./LiLiveContext";

/** Bullet bars (§31 #12): one paragraph (the selected one, else the first) against common mockup slots — which ones it fits, and by how much it overflows. */
export default function LiFitTargets() {
  const t = useTranslations("tools.lorem-ipsum-generator.live.fit");
  const { analysis: a, activeParagraph, f, pct } = useLiLive();
  const focus = a.paragraphs[activeParagraph ?? 0];
  const chars = focus?.characters ?? 0;
  const fitting = FIT_TARGETS.filter((s) => chars <= s.max);
  const smallest = fitting[0];
  const largestOver = [...FIT_TARGETS].reverse().find((s) => chars > s.max);

  const indicator = (
    <div className="w-full sm:w-[330px]">
      <ul className="space-y-2.5">
        {FIT_TARGETS.map((s) => {
          const share = chars / s.max;
          const over = share > 1;
          return (
            <li key={s.key}>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="font-medium text-zinc-700 dark:text-zinc-200">{t(`targets.${s.key}`)}</span>
                <span dir="ltr" className={`font-mono font-semibold ${over ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-300"}`}>
                  {f(chars)} / {f(s.max)}
                </span>
              </div>
              <div className="relative mt-1 h-4 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`absolute inset-y-0 start-0 rounded-full ${over ? "bg-rose-600" : "bg-emerald-500 dark:bg-emerald-400"}`}
                  style={{ width: `${Math.min(1, share) * 100}%`, transition: "width 350ms ease" }}
                />
                {over && (
                  <span dir="auto" className="absolute inset-y-0 end-1.5 flex items-center text-[9px] font-bold text-white">
                    {t("overBy", { n: f(chars - s.max) })}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-300">{t("hint", { n: f((focus?.index ?? 0) + 1) })}</p>
    </div>
  );

  return (
    <LiIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("characters", { n: f((focus?.index ?? 0) + 1) }), value: f(chars) },
        { label: t("fits"), value: `${f(fitting.length)} / ${f(FIT_TARGETS.length)}` },
        ...(largestOver ? [{ label: t("trim", { slot: t(`targets.${largestOver.key}`) }), value: f(chars - largestOver.max), note: `${f(chars)} − ${f(largestOver.max)}` }] : []),
        { label: t("whole"), value: `×${f(a.characters / FIT_TARGETS[FIT_TARGETS.length - 1].max, 1)}`, note: `${f(a.characters)} ÷ ${f(FIT_TARGETS[FIT_TARGETS.length - 1].max)}` },
        smallest
          ? { label: t("smallest"), value: t(`targets.${smallest.key}`), emphasize: true, note: t("fillNote", { share: pct(chars / smallest.max) }) }
          : { label: t("smallest"), value: t("none"), emphasize: true, note: t("noneNote", { max: f(FIT_TARGETS[FIT_TARGETS.length - 1].max) }) },
      ]}
    />
  );
}
