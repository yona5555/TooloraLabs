"use client";
import { useTranslations } from "next-intl";
import type { HarmonyType, PaletteColor } from "@tooloralabs/tools";
import { ltr } from "@/components/tool-ui/MixedText";
import CopyButton from "@/components/tool-ui/CopyButton";
import { generateColorPalette, hexToRgb } from "@tooloralabs/tools";
import ColorPaletteQuickReference from "./ColorPaletteQuickReference";
import { hsl, hueName, MONOCHROMATIC_LIGHTNESS, SAMPLE_HEX } from "./paletteMath";

/** Real values only: the tool's sample and the colours from this page's own worked examples. */
const QUICK = ["#3B82F6", "#F6AF3B", "#F63B82", "#82F63B", "#0B64F4"];

/** The typed value laid into the #RR GG BB channel slots: which channel is missing or holds a non-hex digit. */
function HexSlots({ value }: { value: string }) {
  const t = useTranslations("tools.color-palette-generator.form.extras");
  const body = Array.from(value.trim().replace(/^#/, ""));
  const chans = [
    { key: "r", label: t("slotR") },
    { key: "g", label: t("slotG") },
    { key: "b", label: t("slotB") },
  ];
  return (
    <div data-testid="cp-slots">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("slotsTitle")}</h3>
      <div dir="ltr" className="flex h-11 overflow-hidden rounded-xl" style={{ border: "1px solid var(--ph-line)" }}>
        <div className="flex w-9 items-center justify-center font-mono text-sm font-bold" style={{ background: "var(--glass-track)", color: "var(--ph-ink-muted)" }}>
          #
        </div>
        {chans.map((ch, i) => {
          const pair = [body[i * 2], body[i * 2 + 1]];
          const ok = pair.every((c) => c !== undefined && /[0-9a-fA-F]/.test(c));
          return (
            <div
              key={ch.key}
              className="flex flex-1 items-center justify-center gap-0.5 font-mono text-sm font-bold"
              style={{ borderInlineStart: "1px solid var(--ph-line)", background: ok ? "var(--glass-success-soft)" : "var(--glass-danger-soft)", color: ok ? "var(--glass-success-strong)" : "var(--glass-danger-strong)" }}
            >
              {pair.map((c, k) => (
                <span key={k}>{c === undefined ? "·" : c}</span>
              ))}
              {ok && <span className="ms-1 text-[10px] font-semibold opacity-80">= {parseInt(pair.join(""), 16)}</span>}
            </div>
          );
        })}
      </div>
      <div dir="ltr" className="mt-1 flex text-center text-[10px]" style={{ color: "var(--ph-ink-muted)" }}>
        <span className="w-9" />
        {chans.map((ch) => (
          <span key={ch.key} className="flex-1">
            {ch.label}
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] leading-4" style={{ color: "var(--ph-ink-muted)" }}>
        {body.length > 6 ? t("slotsExtra", { n: String(body.length - 6) }) : t("slotsNote")}
      </p>
    </div>
  );
}

export default function PaletteInputExtras({
  baseHex,
  harmony,
  palette,
  onPick,
}: {
  baseHex: string;
  harmony: HarmonyType;
  palette: PaletteColor[];
  onPick: (hex: string) => void;
}) {
  const t = useTranslations("tools.color-palette-generator.form.extras");
  const tN = useTranslations("tools.color-palette-generator.hueNames");
  const valid = palette.length > 0;
  const c = valid ? hsl(baseHex.startsWith("#") ? baseHex : `#${baseHex}`) : null;
  const parts = c
    ? [
        { key: "h", label: t("hue"), value: `${Math.round(c.h)}°`, frac: c.h / 360 },
        { key: "s", label: t("saturation"), value: `${Math.round(c.s)}%`, frac: c.s / 100 },
        { key: "l", label: t("lightness"), value: `${Math.round(c.l)}%`, frac: c.l / 100 },
      ]
    : [];

  return (
    <div className="mt-6 flex flex-col gap-5">
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("quickSamplesTitle")}</h3>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((hex) => {
            const on = hex.toLowerCase() === baseHex.toLowerCase();
            return (
              <button
                key={hex}
                type="button"
                onClick={() => onPick(hex)}
                className={`flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs font-medium transition ${on ? "border-blue-500 text-blue-700 dark:text-blue-300" : "border-zinc-300 text-zinc-700 hover:border-blue-400 dark:border-zinc-600 dark:text-zinc-200"}`}
              >
                <span className="h-3.5 w-3.5 rounded-sm" style={{ background: hex, border: "1px solid var(--ph-line)" }} />
                <span dir="ltr">{hex}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div data-testid="cp-hsl">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("hslTitle")}</h3>
        {c ? (
          <div className="flex flex-col gap-1.5">
            {parts.map((p) => (
              <div key={p.key} className="flex items-center gap-2 text-xs">
                <span className="w-20 shrink-0" style={{ color: "var(--ph-ink-muted)" }}>
                  {p.label}
                </span>
                <div dir="ltr" className="relative h-2.5 flex-1 rounded-full" style={{ background: "var(--glass-track)" }}>
                  <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${p.frac * 100}%`, background: "var(--ph-accent-strong)" }} />
                </div>
                <span dir="ltr" className="w-11 shrink-0 text-end font-mono font-semibold" style={{ color: "var(--ph-ink)" }}>
                  {p.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: "var(--glass-danger-strong)" }}>
            {t("hslInvalid")}
          </p>
        )}
      </div>

      {!c && <HexSlots value={baseHex} />}

      {c && (
        <div data-testid="cp-formats">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("formatsTitle")}</h3>
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--ph-line)" }}>
            {(() => {
              const hex = (baseHex.startsWith("#") ? baseHex : `#${baseHex}`).toUpperCase();
              const rgb = hexToRgb(hex);
              return [
                { k: "HEX", v: hex },
                { k: "RGB", v: `rgb(${rgb?.r}, ${rgb?.g}, ${rgb?.b})` },
              ];
            })().map((f, i) => (
              <div key={f.k} dir="ltr" className="flex items-center gap-2 px-3 py-2" style={{ borderTop: i ? "1px solid var(--ph-line)" : undefined }}>
                <span className="w-9 shrink-0 text-[10px] font-bold" style={{ color: "var(--ph-ink-muted)" }}>
                  {f.k}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs font-semibold" style={{ color: "var(--ph-ink)" }}>
                  {f.v}
                </span>
                <CopyButton text={f.v} className="px-2 py-1 text-[11px]" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div data-testid="cp-hues">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("huesTitle")}</h3>
        {valid ? (
          <ol className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--ph-line)" }}>
            {palette.map((p, i) => {
              const ph = hsl(p.hex);
              return (
                <li key={i} className="flex h-5 items-center gap-2 px-3 text-xs leading-5" style={{ borderTop: i ? "1px solid var(--ph-line)" : undefined }}>
                  <span className="w-4 tabular-nums" style={{ color: "var(--ph-ink-muted)" }}>
                    {i + 1}
                  </span>
                  <span className="h-3 w-3 rounded-sm" style={{ background: p.hex, border: "1px solid var(--ph-line)" }} />
                  <span dir="ltr" className="font-mono font-semibold" style={{ color: "var(--ph-ink)" }}>
                    {harmony === "monochromatic" ? `L ${MONOCHROMATIC_LIGHTNESS[i]}%` : `${Math.round(ph.h)}°`}
                  </span>
                  <span className="ms-auto truncate" style={{ color: "var(--ph-ink-muted)" }}>
                    {tN(hueName(ph.h))}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <>
            <p className="mb-1 text-xs" style={{ color: "var(--ph-ink-muted)" }}>
              {t("huesInvalid", { hex: ltr(SAMPLE_HEX) })}
            </p>
            <ol className="overflow-hidden rounded-xl opacity-80" style={{ border: "1px dashed var(--ph-line)" }}>
              {generateColorPalette(SAMPLE_HEX, "complementary").map((p, i) => {
                const ph = hsl(p.hex);
                return (
                  <li key={i} className="flex h-5 items-center gap-2 px-3 text-xs leading-5" style={{ borderTop: i ? "1px dashed var(--ph-line)" : undefined }}>
                    <span className="w-4 tabular-nums" style={{ color: "var(--ph-ink-muted)" }}>
                      {i + 1}
                    </span>
                    <span className="h-3 w-3 rounded-sm" style={{ background: p.hex, border: "1px solid var(--ph-line)" }} />
                    <span dir="ltr" className="font-mono font-semibold" style={{ color: "var(--ph-ink)" }}>
                      {`${Math.round(ph.h)}°`}
                    </span>
                    <span className="ms-auto truncate" style={{ color: "var(--ph-ink-muted)" }}>
                      {tN(hueName(ph.h))}
                    </span>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>

      <ColorPaletteQuickReference harmony={harmony} />
    </div>
  );
}
