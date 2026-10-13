"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassHandle } from "@/components/tool-ui/glass/GlassPrimitives";
import { KitControls, useStepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { ltr } from "@/components/tool-ui/MixedText";

/** Lens magnification of the image's real pixels (not of its on-screen size), so artefacts show. */
const ZOOM = 3;

/**
 * §44 (2D): the before / after comparison at the top of the Result card. The original fills the
 * frame; the converted image covers it to the right of a draggable vertical divider (also moved by
 * the − / + / reset buttons). A lens beside the handle magnifies ×3 (real pixels) the spot under it, original on
 * its left half and the real converted output on its right half, so artefacts in fine detail and
 * gradients are visible. Dragging also moves the lens focus up and down.
 */
export default function ImageCompare({
  originalUrl,
  resultUrl,
  width,
  height,
  formatLabel,
  isSample,
}: {
  originalUrl: string;
  resultUrl: string;
  width: number;
  height: number;
  formatLabel: string;
  isSample: boolean;
}) {
  const t = useTranslations("tools.image-converter.visuals.result");
  // Seeded on the macaw's head (eye and fine face feathers), where artefacts show first.
  const s = useStepper(35, { min: 0, max: 100, step: 5 });
  const [focusY, setFocusY] = useState(30);
  const box = useRef<HTMLDivElement>(null);
  const [bw, setBw] = useState(0);
  const [bh, setBh] = useState(0);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setBw(e.contentRect.width);
      setBh(e.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const dragging = useRef(false);
  const report = (e: React.PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    s.set(((e.clientX - r.left) / r.width) * 100);
    setFocusY(Math.min(92, Math.max(8, ((e.clientY - r.top) / r.height) * 100)));
  };
  const pos = s.value;

  // Where the image actually sits inside the frame (object-contain letterboxing).
  const scale = bw && bh ? Math.min(bw / width, bh / height) : 0;
  const dw = width * scale;
  const dh = height * scale;
  const ox = (bw - dw) / 2;
  const oy = (bh - dh) / 2;
  const hx = (pos / 100) * bw;
  const hy = (focusY / 100) * bh;
  // Kept between the corner labels (top and bottom 40 px), so it never covers them (§39).
  const lens = Math.round(Math.max(90, Math.min(180, bh * 0.6, bh - 84)));
  // Beside the handle (right if it fits, else left), centred on the focus point, inside the frame.
  const right = hx + 28 + lens <= bw - 6;
  const lensLeft = right ? hx + 28 : Math.max(6, hx - 28 - lens);
  const lensTop = Math.min(bh - lens - 42, Math.max(42, hy - lens / 2));
  const bg = (url: string) => ({
    backgroundImage: `url("${url}")`,
    backgroundSize: `${width * ZOOM}px ${height * ZOOM}px`,
    backgroundPosition: `${lens / 2 - ((hx - ox) / scale) * ZOOM}px ${lens / 2 - ((hy - oy) / scale) * ZOOM}px`,
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated" as const,
  });

  return (
    <div data-ph-scene-block className="flex flex-col gap-3">
      <div
        ref={box}
        dir="ltr"
        data-testid="image-compare"
        className="relative w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-xl"
        style={{ aspectRatio: `${width} / ${height}`, maxHeight: 340, background: "var(--glass-track)", border: "1px solid var(--ph-line)" }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          report(e);
        }}
        onPointerMove={(e) => dragging.current && report(e)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={originalUrl} alt={t("original")} draggable={false} className="absolute inset-0 h-full w-full object-contain" />
        {resultUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resultUrl}
            alt={t("converted", { format: formatLabel })}
            draggable={false}
            data-testid="image-compare-after"
            className="absolute inset-0 h-full w-full object-contain"
            style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
          />
        )}
        <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2" style={{ left: `${pos}%`, background: "var(--ph-knob)", boxShadow: "0 0 0 1px var(--ph-line)" }} />
        <span dir="auto" className="pointer-events-none absolute left-2 top-2 rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: "var(--ph-surface)", color: "var(--ph-ink)" }}>
          {t("original")}
        </span>
        <span dir="auto" className="pointer-events-none absolute right-2 top-2 rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: "var(--ph-surface)", color: "var(--cv-from)" }}>
          {t("converted", { format: ltr(formatLabel) })}
        </span>
        {isSample && (
          <span dir="auto" data-testid="image-sample-label" className="pointer-events-none absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: "var(--ph-surface)", color: "var(--ph-ink-muted)" }}>
            {t("sample")}
          </span>
        )}
        {scale > 0 && (
          <div
            aria-hidden="true"
            data-testid="image-lens"
            data-zoom={ZOOM}
            className="pointer-events-none absolute overflow-hidden rounded-full"
            style={{ left: lensLeft, top: lensTop, width: lens, height: lens, border: "3px solid var(--ph-knob)", boxShadow: "0 0 0 1px var(--ph-line), 0 6px 18px rgba(0,0,0,.35)", background: "var(--glass-track)" }}
          >
            <div className="absolute inset-0" style={bg(originalUrl)} />
            {resultUrl && <div data-testid="image-lens-after" className="absolute inset-0" style={{ ...bg(resultUrl), clipPath: "inset(0 0 0 50%)" }} />}
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2" style={{ background: "var(--ph-knob)" }} />
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums" style={{ background: "var(--ph-surface)", color: "var(--ph-ink)" }}>
              ×{ZOOM}
            </span>
          </div>
        )}
        <GlassHandle
          direction="free"
          ariaLabel={t("compareHandle")}
          onStep={(d) => (d > 0 ? s.inc() : s.dec())}
          valueNow={pos}
          valueMin={0}
          valueMax={100}
          style={{ left: `${pos}%`, top: `${focusY}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>
      <p className="text-center text-xs" style={{ color: "var(--ph-ink-muted)" }}>
        {t("lens", { zoom: ZOOM })}
      </p>
      <KitControls s={s} valueText={`${pos} %`} testId="image-compare" />
    </div>
  );
}
