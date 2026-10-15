# TooloraLabs — Compact Rules Summary

Loaded at every session start in place of the full rulebook. Read a specific section of
TooloraLabs-Claude-Instructions.md only when a task needs it; never load the whole file.

## Project basics
- Package manager: npm only (no yarn/pnpm), npm workspaces monorepo.
- Layout: `apps/web` (Next.js site) + `packages/core|sdk|tools` (shared logic) + `docs/claude/` (handbook, read on demand).
- `packages/core|sdk|tools` are pure logic only — no `window`/`document`/DOM, enforced by `tsconfig.base.json`.
- UI text ships in all 6 locales (en, ar, es, fr, de, hi) with 1:1 key parity; Arabic is Modern Standard Arabic site-wide.
- Git: pull before work; commit + push after each finished part; no force-push, no `reset --hard`; verify CI after push.
- Multi-device: pull and check status before starting work in any session (Mac = coordinator, Linux = worker).

## Visual rules §37–44 (one line each; full detail and verification checks live in the main rulebook)
- §37 Every indicator uses the shared framed `SectionCard` (identical blue header); drawing+table side by side on desktop, stacked on mobile; each indicator's state is fully independent of the hero and of every other indicator.
- §38 No grid/waffle/tiled indicators built from equal-size cells — connected shapes only (arcs, rings, bars, ribbons, sliders, gauges, area-under-curve).
- §39 No label ever overlaps another label, handle, tick, axis or curve at any draggable state; use the shared collision-avoidance helper, not ad-hoc offsets.
- §40 Every draggable control uses one unified handle: direction icon, attention pulse that stops after first real interaction, ≥44×44px touch target, keyboard-operable, shared accessible name, ≥3:1 non-text contrast.
- §41 Zero tolerance for visual empty space over 16px in any card or column; fill it with real, connected, interactive content — never padding, filler text, or a shrunk box; sibling columns in a row end at the same bottom edge (≤2px).
- §42 An indicator's drawing and its WORKED EXAMPLE table always show the same value; a changed value flashes the affected table cell and pulses the matching part of the drawing once.
- §43 Every draggable indicator with a steppable value also exposes tangible on-card minus/plus buttons (hold-to-repeat) plus a reset-to-seed button — never drag alone.
- §44 The Result card carries the tool's own main visual at its top, no separate hero card; 3D only where a solid shape adds real meaning (chemistry, physics, geometry-oriented math), 2D everywhere else; scientific symbols keep their exact letter case (pH, not PH).

## Lessons learned (apply by default, not case by case)
- Real data only — never invent or simulate a figure; state any data limit on the page next to it.
- A main visual that needs decor or illustration uses a ready-made asset under CC0 or an equivalent permissive licence (credited in `apps/web/public/samples/CREDITS.md`), not complex hand-drawn art.
- Close an empty-space gap with real content and by rebalancing content between columns — never by stretching one box or hard-coding a height tuned to a single sample; that drifts apart again for any other input length.
- Error states and empty states are real page states too — they must fill their space exactly like the normal/valid state, not fall back to a bare one-line message.
- Every interactive visual needs a handle (drag) plus on-card minus/plus/reset buttons — the handle alone is not enough (§40 + §43 combined).
